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
	}
	if err := json.Unmarshal(body, &p); err != nil {
		return
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
	fee := int(math.Round(float64(p.Amount) * store.FeePct / 100.0))
	basis := store.FeeBasis
	if basis == "" {
		basis = "total"
	}
	row := model.PlatformFee{
		StoreID:    store.ID,
		Period:     time.Now().Format("2006-01"),
		ExternalID: p.ExternalID,
		InvoiceID:  p.ID,
		Gross:      p.Amount,
		Basis:      basis,
		FeePct:     store.FeePct,
		FeeAmount:  fee,
		Status:     "accrued",
		Note:       "accrual otomatis dari webhook PAID",
	}
	if err := model.DB.Create(&row).Error; err != nil {
		log.Printf("[fee] gagal simpan accrual %s: %v", p.ExternalID, err)
		return
	}
	log.Printf("[fee] accrual store=%s ext=%s gross=%d fee=%d (pct=%.2f)", store.Slug, p.ExternalID, p.Amount, fee, store.FeePct)
}

// ForwardToClientStore — Payment Hub routing: kalau external_id webhook Xendit
// diawali prefix client store aktif (contoh "mg-"), seluruh payload callback
// DIFORWARD ke webhook store (`BaseURL + /api/v1/webhook/xendit`, atau kolom
// webhook_url kalau diisi) dengan header `X-Logikraf-Signature` (shared secret
// per store). Alasan: akun Xendit milik Logikraf → satu URL webhook di dashboard
// (logikraf.id) → store tidak perlu konfigurasi webhook sendiri.
//
// Return handled=true artinya request ini milik client store (sukses diforward
// atau gagal — error mesti diteruskan ke caller supaya Xendit me-retry).
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

	whURL := store.WebhookURL
	if whURL == "" {
		whURL = strings.TrimSuffix(store.BaseURL, "/") + "/api/v1/webhook/xendit"
	}
	if whURL == "" {
		return true, fmt.Errorf("client store %s tanpa base_url/webhook_url", store.Slug)
	}

	body := c.Body()
	req, err := http.NewRequest(http.MethodPost, whURL, bytes.NewReader(body))
	if err != nil {
		return true, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Logikraf-Signature", store.WebhookSecret)
	if tk := c.Get("X-Callback-Token"); tk != "" {
		req.Header.Set("X-Callback-Token", tk) // fallback utk store jalur langsung
	}

	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return true, err
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Biaya layanan platform dihitung dari transaksi yang benar-benar dibayar.
		accruePlatformFee(store, body)
		return true, nil
	}
	return true, fmt.Errorf("webhook store %s balas HTTP %d", store.Slug, resp.StatusCode)
}
