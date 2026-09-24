package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// accruePlatformFee — catat biaya layanan platform untuk transaksi store yang PAID.
// Idempotent per (store_id, external_id): webhook Xendit bisa datang berulang.
func accruePlatformFee(store *model.ClientStore, body []byte) {
	if store == nil || !store.FeeEnabled || store.FeePct <= 0 {
		return
	}
	var p struct {
		ID         string `json:"id"`
		ExternalID string `json:"external_id"`
		Status     string `json:"status"`
		Amount     int    `json:"amount"`
		Metadata   struct {
			ProductSubtotal int `json:"product_subtotal"`
		} `json:"metadata"`
	}
	if err := json.Unmarshal(body, &p); err != nil {
		return
	}
	// Basis biaya layanan: subtotal produk (kalau store mengirimkannya via
	// metadata invoice) — supaya ongkir tidak ikut dikenakan fee.
	basis := p.Amount
	basisLabel := "total"
	if p.Metadata.ProductSubtotal > 0 && p.Metadata.ProductSubtotal <= p.Amount {
		basis = p.Metadata.ProductSubtotal
		basisLabel = "product"
	}
	if !strings.EqualFold(strings.TrimSpace(p.Status), "PAID") && !strings.EqualFold(strings.TrimSpace(p.Status), "SETTLED") {
		return
	}
	if p.ExternalID == "" || p.Amount <= 0 {
		return
	}
	var count int64
	model.DB.Model(&model.PlatformFee{}).Where("store_id = ? AND external_id = ?", store.ID, p.ExternalID).Count(&count)
	if count > 0 {
		return
	}
	fee := int(math.Round(float64(basis) * store.FeePct / 100.0))
	row := model.PlatformFee{
		StoreID:    store.ID,
		Period:     time.Now().Format("2006-01"),
		ExternalID: p.ExternalID,
		InvoiceID:  p.ID,
		Gross:      basis,
		Basis:      basisLabel,
		FeePct:     store.FeePct,
		FeeAmount:  fee,
		Status:     "accrued",
		Note:       "accrual otomatis dari webhook PAID",
	}
	if err := model.DB.Create(&row).Error; err != nil {
		log.Printf("[fee] gagal simpan accrual %s: %v", p.ExternalID, err)
		return
	}
	log.Printf("[fee] accrual store=%s ext=%s basis=%s gross=%d fee=%d (pct=%.2f)", store.Slug, p.ExternalID, basisLabel, basis, fee, store.FeePct)
}

// forwardRawToStore — kirim payload mentah ke webhook store.
//
// Header yang dikirim:
//   - X-Logikraf-Signature       : shared secret mentah (perilaku lama, kompatibel MysticGlide)
//   - X-Logikraf-Signature-Hmac  : HMAC-SHA256(body, shared secret) — cara aman bagi konsumen baru (Smarthub)
//   - X-Logikraf-Store           : slug store
//   - X-Logikraf-Tenant-Ref      : tenant_ref (untuk event akun/payout yang tidak punya external_id)
//   - X-Callback-Token           : diteruskan bila ada
func forwardRawToStore(store *model.ClientStore, body []byte, tenantRef, callbackToken string) error {
	if store == nil {
		return fmt.Errorf("store nil")
	}
	whURL := store.WebhookURL
	if whURL == "" {
		whURL = strings.TrimSuffix(store.BaseURL, "/") + "/api/v1/webhook/xendit"
	}
	if whURL == "" {
		return fmt.Errorf("client store %s tanpa base_url/webhook_url", store.Slug)
	}
	req, err := http.NewRequest(http.MethodPost, whURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Logikraf-Signature", store.WebhookSecret) // kompatibilitas lama (raw secret)
	if store.WebhookSecret != "" {
		req.Header.Set("X-Logikraf-Signature-Hmac", hmacSHA256Hex(store.WebhookSecret, body))
	}
	req.Header.Set("X-Logikraf-Store", store.Slug)
	if tenantRef != "" {
		req.Header.Set("X-Logikraf-Tenant-Ref", tenantRef)
	}
	if callbackToken != "" {
		req.Header.Set("X-Callback-Token", callbackToken) // fallback utk store jalur langsung
	}

	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Biaya layanan platform dihitung dari transaksi yang benar-benar dibayar.
		accruePlatformFee(store, body)
		return nil
	}
	return fmt.Errorf("webhook store %s balas HTTP %d", store.Slug, resp.StatusCode)
}

// ForwardToClientStore — Payment Hub routing: kalau external_id webhook Xendit
// diawali prefix client store aktif (contoh "mg-"), seluruh payload callback
// DIFORWARD ke webhook store. Return handled=true artinya request ini milik
// client store (sukses diforward atau gagal — error mesti diteruskan ke caller
// supaya Xendit me-retry).
func ForwardToClientStore(c fiber.Ctx, externalID string) (bool, error) {
	if externalID == "" {
		return false, nil
	}
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1 AND ext_prefix <> ''").Find(&stores).Error; err != nil {
		return false, err
	}
	var store *model.ClientStore
	for i := range stores {
		if strings.HasPrefix(strings.ToLower(externalID), strings.ToLower(stores[i].ExtPrefix)) {
			store = &stores[i]
			break
		}
	}
	if store == nil {
		return false, nil // bukan client store — proses lokal
	}
	tenantRef := tenantRefForExternal(*store, externalID)
	if err := forwardRawToStore(store, c.Body(), tenantRef, c.Get("X-Callback-Token")); err != nil {
		return true, err
	}
	return true, nil
}

// tenantRefForExternal — cari sub-akun tenant yang cocok dengan external_id/QRIS
// agar header X-Logikraf-Tenant-Ref terisi saat forward.
func tenantRefForExternal(store model.ClientStore, externalID string) string {
	var qp model.QrisPayment
	if err := model.DB.Where("store_id = ? AND external_id = ?", store.ID, externalID).
		Order("id desc").First(&qp).Error; err == nil && qp.SubAccountID != "" {
		var sub model.ClientSubAccount
		if err := model.DB.Where("sub_account_id = ?", qp.SubAccountID).First(&sub).Error; err == nil {
			return sub.TenantRef
		}
	}
	return ""
}

// ForwardSubAccountEvent — teruskan event akun XenPlatform (account.verification
// dll) atau payout ke store pemilik sub-akun, dengan tenant_ref sebagai konteks.
// Return true bila event berhasil dipetakan ke store (sukses atau gagal forward).
func ForwardSubAccountEvent(c fiber.Ctx, subAccountID string) (bool, error) {
	subAccountID = strings.TrimSpace(subAccountID)
	if subAccountID == "" {
		return false, nil
	}
	var sub model.ClientSubAccount
	if err := model.DB.Where("sub_account_id = ?", subAccountID).First(&sub).Error; err != nil {
		return false, nil
	}
	var store model.ClientStore
	if err := model.DB.First(&store, sub.StoreID).Error; err != nil {
		return false, nil
	}
	if err := forwardRawToStore(&store, c.Body(), sub.TenantRef, c.Get("X-Callback-Token")); err != nil {
		return true, err
	}
	return true, nil
}

// payoutStatusFromBody — ambil status payout dari payload v3 (status bisa
// top-level atau di dalam `data`).
func payoutStatusFromBody(body []byte) string {
	var ev struct {
		Status string `json:"status"`
		Data   struct {
			Status string `json:"status"`
		} `json:"data"`
	}
	_ = json.Unmarshal(body, &ev)
	s := ev.Status
	if s == "" {
		s = ev.Data.Status
	}
	return statusPayoutNormalized(s)
}

// ForwardPayoutToOwningStore — petakan event payout ke baris Payout
// (reference_id / provider_id), perbarui status lokal, lalu teruskan payload ke
// store pemilik sub-akun. Return true bila event berhasil dipetakan ke store.
func ForwardPayoutToOwningStore(c fiber.Ctx) bool {
	body := c.Body()
	var ev struct {
		ReferenceID string `json:"reference_id"`
		Data        struct {
			ReferenceID string `json:"reference_id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(body, &ev)
	ref := ev.ReferenceID
	if ref == "" {
		ref = ev.Data.ReferenceID
	}
	if ref == "" {
		return false
	}
	var row model.Payout
	if err := model.DB.Where("external_id = ? OR provider_id = ?", ref, ref).First(&row).Error; err != nil {
		return false
	}
	var store model.ClientStore
	if err := model.DB.First(&store, row.StoreID).Error; err != nil {
		return false
	}
	if status := payoutStatusFromBody(body); status != "" {
		_ = model.DB.Model(&model.Payout{}).Where("id = ?", row.ID).Update("status", status).Error
	}
	if err := forwardRawToStore(&store, body, row.TenantRef, c.Get("X-Callback-Token")); err != nil {
		log.Printf("[payout-webhook] forward ke store %s gagal: %v", store.Slug, err)
	}
	return true
}
