package handler

import (
	"bytes"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// CreateClientStoreQris — QRIS atas nama client store (mis. MysticGlide) lewat
// satu pintu hub. Auth: header X-Internal-Key milik store.
// Body: { external_id, amount, description }
// Respons: { reference_id, qr_string, amount, expires_at, simulate_allowed }
func CreateClientStoreQris(c fiber.Ctx) error {
	got := c.Get("X-Internal-Key")
	if got == "" {
		return c.Status(401).JSON(fiber.Map{"error": "missing X-Internal-Key"})
	}
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1").Find(&stores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "db error"})
	}
	var store model.ClientStore
	found := false
	for _, s := range stores {
		if s.InternalKey != "" && subtle.ConstantTimeCompare([]byte(got), []byte(s.InternalKey)) == 1 {
			store = s
			found = true
			break
		}
	}
	if !found {
		return c.Status(401).JSON(fiber.Map{"error": "invalid internal key"})
	}

	var in struct {
		ExternalID  string `json:"external_id"`
		Amount      int    `json:"amount"`
		Description string `json:"description"`
		ExpiresIn   int    `json:"expires_in_minutes"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.ExternalID == "" || in.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "external_id & amount wajib"})
	}
	// Prefix store wajib (mis. MG-) — mencegah klaim lintas store.
	if store.ExtPrefix != "" && !strings.HasPrefix(strings.ToLower(in.ExternalID), strings.ToLower(store.ExtPrefix)) {
		return c.Status(400).JSON(fiber.Map{"error": "external_id harus diawali prefix store"})
	}

	// Idempotensi: satu external_id = satu QR aktif.
	//
	// Klien (Smarthub, MG) sering memanggil ulang endpoint ini untuk tagihan
	// yang sama — misalnya warga membuka halaman QR dua kali, atau QR lama
	// sudah kedaluwarsa. Tanpa blok ini, panggilan kedua selalu gagal 500
	// "Duplicate entry" padahal QR pertama masih sah (dan QR baru sudah
	// terlanjur dibuat di Xendit → pembayaran nyasar tak terpakai).
	refID := in.ExternalID
	var ada model.QrisPayment
	if e := model.DB.Where("reference_id = ?", refID).First(&ada).Error; e == nil {
		switch {
		case strings.EqualFold(ada.Status, "paid"):
			return c.Status(409).JSON(fiber.Map{
				"error":        "pembayaran untuk referensi ini sudah lunas",
				"reference_id": ada.ReferenceID,
				"status":       ada.Status,
				"amount":       ada.Amount,
			})
		case strings.EqualFold(ada.Status, "pending") && ada.ExpiresAt != nil && ada.ExpiresAt.After(time.Now()):
			// Masih berlaku → kembalikan QR yang sama, tanpa memanggil Xendit.
			return c.Status(200).JSON(fiber.Map{
				"reference_id":     ada.ReferenceID,
				"external_id":      ada.ExternalID,
				"qr_string":        ada.QrString,
				"amount":           ada.Amount,
				"currency":         ada.Currency,
				"status":           ada.Status,
				"mode":             ada.Mode,
				"expires_at":       ada.ExpiresAt,
				"simulate_allowed": qrisSimulateAllowed(),
				"store":            store.Name,
				"diambil_ulang":    true,
			})
		default:
			// Kedaluwarsa/batal → terbitkan QR baru dengan referensi unik
			// (kolom reference_id unik, dan Xendit juga menolak duplikat).
			refID = fmt.Sprintf("%s-%d", in.ExternalID, time.Now().Unix())
		}
	}

	secret := qrisSecret()
	if secret == "" {
		return c.Status(503).JSON(fiber.Map{"error": "xendit_secret_key belum dikonfigurasi"})
	}

	bodyMap := map[string]any{
		"reference_id": refID,
		"amount":       in.Amount,
		"currency":     "IDR",
		"description":  orDefault(in.Description, "Pembayaran "+orDefault(store.Name, "Toko")),
		"payment_method": map[string]any{
			"type":        "QR_CODE",
			"reusability": "ONE_TIME_USE",
			"qr_code":     map[string]any{"channel_code": "QRIS"},
		},
	}
	body, _ := json.Marshal(bodyMap)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/payment_requests", bytes.NewReader(body))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-version", "2024-11-11")
	req.Header.Set("Authorization", qrisBasicAuth(secret))
	// Sub-account store: dipakai hanya kalau KYC sudah LIVE (kalau belum, dana di akun master)
	if store.SubAccountID != "" && strings.EqualFold(store.KYCStatus, "LIVE") {
		req.Header.Set("for-user-id", store.SubAccountID)
	}
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "xendit unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		log.Printf("[qris-store] create gagal (%d): %s", resp.StatusCode, strings.TrimSpace(string(raw)))
		return c.Status(resp.StatusCode).JSON(fiber.Map{"error": "xendit: " + strings.TrimSpace(string(raw))})
	}

	var out struct {
		ID            string `json:"id"`
		Status        string `json:"status"`
		PaymentMethod struct {
			QRCode struct {
				ChannelProperties struct {
					QRString string `json:"qr_string"`
				} `json:"channel_properties"`
			} `json:"qr_code"`
		} `json:"payment_method"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad xendit response"})
	}
	qrString := strings.TrimSpace(out.PaymentMethod.QRCode.ChannelProperties.QRString)
	exp := time.Now().Add(15 * time.Minute)
	if in.ExpiresIn > 0 {
		exp = time.Now().Add(time.Duration(in.ExpiresIn) * time.Minute)
	}
	p := model.QrisPayment{
		ReferenceID: refID,
		StoreID:     store.ID,
		ExternalID:  in.ExternalID,
		ProviderID:  out.ID,
		QrString:    qrString,
		Amount:      in.Amount,
		Currency:    "IDR",
		ChannelCode: "QRIS",
		Status:      "pending",
		Mode:        qrisMode(),
		ExpiresAt:   &exp,
		RawProvider: string(raw),
	}
	if err := model.DB.Create(&p).Error; err != nil {
		log.Printf("[qris-store] gagal simpan: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "gagal simpan pembayaran"})
	}
	qrisPublishSnapshot(&p)
	log.Printf("[qris-store] %s dibuat store=%s amount=%d", p.ReferenceID, store.Name, p.Amount)

	return c.Status(201).JSON(fiber.Map{
		"reference_id":     p.ReferenceID,
		"external_id":      p.ExternalID,
		"qr_string":        p.QrString,
		"amount":           p.Amount,
		"currency":         p.Currency,
		"status":           p.Status,
		"mode":             p.Mode,
		"expires_at":       p.ExpiresAt,
		"simulate_allowed": qrisSimulateAllowed(),
		"store":            store.Name,
	})
}
