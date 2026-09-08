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

// isAccountEvent — deteksi event akun XenPlatform: ada account_id/business_id
// atau penanda event akun; BUKAN invoice (yang punya external_id mg-*).
func isAccountEvent(raw string) bool {
	for _, k := range []string{`"account_id"`, `"business_id"`, `"sub_account_id"`} {
		if strings.Contains(raw, k) {
			return true
		}
	}
	l := strings.ToLower(raw)
	return strings.Contains(l, "account.verification") || strings.Contains(l, "account.suspension") ||
		strings.Contains(l, "verification_status") || strings.Contains(l, "suspension_status")
}

// handleAccountEventWebhook — cocokkan event akun ke client_stores.sub_account_id,
// perbarui kyc_status dan beri tahu logikraf-partners utk notif WA mitra.
func handleAccountEventWebhook(c fiber.Ctx) error {
	var body map[string]any
	if err := json.Unmarshal(c.Body(), &body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid json"})
	}
	status := strVal(body["status"])
	if status == "" {
		status = strVal(body["verification_status"])
	}
	if status == "" {
		status = strVal(body["suspension_status"])
	}
	if status == "" {
		status = strVal(body["current_status"])
	}
	if status == "" {
		status = strVal(body["new_status"])
	}
	status = strings.ToUpper(strings.TrimSpace(status))

	cands := []string{strVal(body["account_id"]), strVal(body["business_id"]), strVal(body["id"]), strVal(body["sub_account_id"]), c.Get("for-user-id")}
	if status == "" && len(cands) == 0 {
		return c.Status(200).JSON(fiber.Map{"status": "ok", "message": "account event ignored"})
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
	if status != "" && status != store.KYCStatus {
		store.KYCStatus = status
		if err := model.DB.Save(&store).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "gagal simpan status"})
		}
		notifyPartnersKYC(store.ID, status)
	}
	return c.JSON(fiber.Map{"status": "ok", "message": "account event processed", "store_id": store.ID, "kyc_status": status})
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

func strVal(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprintf("%v", v)
}
