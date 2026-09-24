package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ---- Webhook event akun XenPlatform (verification / suspension / created) ----

// isAccountEvent — deteksi event akun XenPlatform. Schema resmi punya
// `business_id` top-level + `event: "account.*"` + `data.{id,status}`.
func isAccountEvent(raw string) bool {
	for _, k := range []string{`"account_id"`, `"business_id"`, `"sub_account_id"`} {
		if strings.Contains(raw, k) {
			return true
		}
	}
	l := strings.ToLower(raw)
	for _, tok := range []string{"account.created", "account.updated", "account.registered", "account.activated", "account.verification", "account.suspected", "account.suspended", "account.cleared", "verification_status", "suspension_status", `"event_type"`} {
		if strings.Contains(l, tok) {
			return true
		}
	}
	// body ber-event lain tanpa external_id invoice (split dll) → coba jalur akun
	return strings.Contains(l, `"event"`) && !strings.Contains(raw, `"external_id"`)
}

// handleAccountEventWebhook — cocokkan event akun ke client_stores.sub_account_id,
// perbarui kyc_status dan beri tahu logikraf-partners utk notif WA mitra.
// Schema payload Xendit tidak flat — pencarian id & status dilakukan rekursif.
func handleAccountEventWebhook(c fiber.Ctx) error {
	var body map[string]any
	if err := json.Unmarshal(c.Body(), &body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid json"})
	}

	status := ""
	var candidates []string
	seen := map[string]bool{}
	walkAccountPayload(body, &status, &candidates, seen)
	// Hanya ID berpola Xendit yang dipakai sebagai kandidat store (payload memuat string
	// non-ID seperti "account.verification" yang bisa mencocokkan store salah).
	cands := trustedAccountIDs(candidates)
	if h := strings.TrimSpace(c.Get("for-user-id")); h != "" {
		cands = append(cands, h)
	}
	if status == "" && len(cands) == 0 {
		return c.Status(200).JSON(fiber.Map{"status": "ok", "message": "account event ignored"})
	}

	// Multi-tenant: cocokkan dulu ke sub-akun per tenant (client_sub_accounts).
	// Bila ketemu, perbarui status sub-akun dan teruskan event ke store pemiliknya.
	for _, cid := range cands {
		if cid == "" {
			continue
		}
		var sub model.ClientSubAccount
		if err := model.DB.Where("sub_account_id = ?", cid).First(&sub).Error; err != nil {
			continue
		}
		if status != "" && status != sub.StatusKYC {
			sub.StatusKYC = status
		}
		var reasons []kycReason
		collectFailureReasons(body, &reasons)
		if len(reasons) > 0 {
			if b, err := json.Marshal(reasons); err == nil {
				sub.FailureJSON = string(b)
			}
		}
		_ = model.DB.Save(&sub).Error
		_, _ = ForwardSubAccountEvent(c, cid)
		return c.JSON(fiber.Map{
			"status": "ok", "message": "sub-account event processed",
			"sub_account_id": cid, "tenant_ref": sub.TenantRef, "kyc_status": sub.StatusKYC,
		})
	}

	var store model.ClientStore
	found := false
	for _, cid := range cands {
		if cid == "" {
			continue
		}
		if err := model.DB.Where("sub_account_id = ?", cid).First(&store).Error; err == nil {
			found = true
			break
		}
	}
	if !found {
		return c.Status(200).JSON(fiber.Map{"status": "ok", "message": "account event ignored (sub-account belum terhubung)"})
	}
	// event informasional (mis. account.registered tanpa status) → cukup tandai processed
	if status == "" {
		return c.JSON(fiber.Map{"status": "ok", "message": "account event processed (tanpa status)", "store_id": store.ID})
	}
	if status != store.KYCStatus {
		store.KYCStatus = status
		if err := model.DB.Save(&store).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "gagal simpan status"})
		}
		notifyPartnersKYC(store.ID, status)
	}
	// simpan riwayat submission + alasan penolakan (dibaca portal mitra)
	var reasons []kycReason
	collectFailureReasons(body, &reasons)
	subID := ""
	if len(cands) > 0 {
		subID = cands[0]
	}
	saveKYCSubmission(store.ID, subID, status, store.EntityType, reasons)
	return c.JSON(fiber.Map{"status": "ok", "message": "account event processed", "store_id": store.ID, "kyc_status": status, "reasons": len(reasons)})
}

// notifyPartnersKYC — fire-and-forget ke logikraf-partners (endpoint internal
// notify/kyc) utk kirim notif WA status KYC ke mitra.
func notifyPartnersKYC(storeID uint, status string) {
	baseURL := os.Getenv("PARTNERS_INTERNAL_URL")
	key := os.Getenv("PARTNERS_INTERNAL_KEY")
	if baseURL == "" || key == "" {
		return
	}
	payload, err := json.Marshal(fiber.Map{"store_id": storeID, "kyc_status": status})
	if err != nil {
		return
	}
	req, err := http.NewRequest("POST", strings.TrimRight(baseURL, "/")+"/api/v1/internal/notify/kyc", bytes.NewReader(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Key", key)
	client := &http.Client{Timeout: 4 * time.Second}
	if resp, err := client.Do(req); err == nil {
		_ = resp.Body.Close()
	}
}

// walkAccountPayload — jelajah JSON rekursif: kumpulkan semua nilai string
// (kandidat id) & status dari key berapa pun (status/verification_status/dll).
func walkAccountPayload(v any, status *string, ids *[]string, seen map[string]bool) {
	switch t := v.(type) {
	case map[string]any:
		for k, val := range t {
			kl := strings.ToLower(k)
			if *status == "" && (kl == "status" || strings.Contains(kl, "status")) {
				if s := strVal(val); s != "" {
					*status = strings.ToUpper(strings.TrimSpace(s))
				}
			}
			if s := strVal(val); s != "" {
				if !seen[s] {
					seen[s] = true
					*ids = append(*ids, s)
				}
			}
			walkAccountPayload(val, status, ids, seen)
		}
	case []any:
		for _, item := range t {
			walkAccountPayload(item, status, ids, seen)
		}
	}
}

// strVal — nilai map jadi string; angka jadi teks (id 24-hex Xendit = string).
func strVal(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprintf("%v", v)
}
