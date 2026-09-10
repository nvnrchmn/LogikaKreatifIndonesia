package handler

import (
	"bytes"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// CreateClientStoreInvoice — "satu pintu": aplikasi client store TIDAK memegang
// key Xendit Logikraf. Store memanggil endpoint ini (X-Internal-Key, server-to-
// server) utk membuat invoice atas namanya; LKI yang berkomunikasi dgn Xendit
// memakai key dari settings tenant logikraf.
//
//	POST /api/client-store-invoices
//	Header: X-Internal-Key: <internal_key store>
//	Body:   {"external_id":"mg-2026...","amount":100000,"payer_email":"...",
//	        "given_names":"...","description":"...",
//	        "success_redirect_url":"...","failure_redirect_url":"...",
//	        "invoice_duration":86400}
func CreateClientStoreInvoice(c fiber.Ctx) error {
	got := c.Get("X-Internal-Key")
	if got == "" {
		return c.Status(401).JSON(fiber.Map{"error": "missing X-Internal-Key"})
	}

	// Temukan store yg key-nya cocok (constant-time)
	var store model.ClientStore
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1").Find(&stores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "db error"})
	}
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
		ExternalID         string `json:"external_id"`
		Amount             int    `json:"amount"`
		PayerEmail         string `json:"payer_email"`
		GivenNames         string `json:"given_names"`
		Description        string `json:"description"`
		SuccessRedirectURL string `json:"success_redirect_url"`
		FailureRedirectURL string `json:"failure_redirect_url"`
		InvoiceDuration    int    `json:"invoice_duration"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if in.ExternalID == "" || in.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "external_id & amount wajib"})
	}
	// Keamanan: external_id HARUS diawali prefix store (mis. "mg-") — mencegah
	// store membuat invoice yg akan di-route/klaim sebagai milik store lain.
	if !strings.HasPrefix(strings.ToLower(in.ExternalID), strings.ToLower(store.ExtPrefix)) {
		return c.Status(400).JSON(fiber.Map{"error": "external_id harus diawali '" + store.ExtPrefix + "'"})
	}
	// Normalisasi identitas: kalau nomor order store SUDAH memuat kode brandnya
	// sendiri (mis. MG-20260907-8336, dikirim sbg "mg-MG-20260907-8336"), buang
	// prefix store sehingga external_id = "MG-20260907-8336" — satu identitas,
	// tanpa dobel prefix. Routing webhook tetap cocok (case-insensitive).
	canonical := in.ExternalID
	if strings.HasPrefix(in.ExternalID, store.ExtPrefix) {
		rest := in.ExternalID[len(store.ExtPrefix):]
		if rest != "" && strings.HasPrefix(strings.ToLower(rest), strings.ToLower(store.ExtPrefix)) {
			canonical = rest
		}
	}
	if in.PayerEmail == "" {
		return c.Status(400).JSON(fiber.Map{"error": "payer_email wajib"})
	}

	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return c.Status(400).JSON(fiber.Map{"error": "xendit_secret_key belum dikonfigurasi"})
	}
	duration := in.InvoiceDuration
	if duration <= 0 {
		duration = 86400 // 24 jam, default Xendit juga
	}

	bodyMap := map[string]any{
		"external_id":          canonical,
		"amount":               in.Amount,
		"payer_email":          in.PayerEmail,
		"description":          orDefault(in.Description, store.Name+" Order"),
		"currency":             "IDR",
		"invoice_duration":     duration,
		"success_redirect_url": in.SuccessRedirectURL,
		"failure_redirect_url": in.FailureRedirectURL,
	}
	if in.GivenNames != "" {
		bodyMap["customer"] = map[string]string{"given_names": in.GivenNames, "email": in.PayerEmail}
	}
	body, _ := json.Marshal(bodyMap)

	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/v2/invoices", bytes.NewReader(body))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	// XenPlatform single-door lanjutan: kalau store punya Managed sub-account LIVE,
	// invoice dibuat ATAS NAMA sub-account (header for-user-id) → dana masuk saldo
	// sub-account mitra, bukan saldo master. Store lama tanpa sub-account tetap
	// seperti sebelumnya (dana ke master Logikraf).
	if store.SubAccountID != "" && strings.EqualFold(store.KYCStatus, "LIVE") {
		req.Header.Set("for-user-id", store.SubAccountID)
	}

	resp, err := (&http.Client{Timeout: 20 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "xendit unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)

	var out any
	if json.Unmarshal(raw, &out) != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad xendit response"})
	}
	return c.Status(resp.StatusCode).JSON(out)
}

// ExpireClientStoreInvoice — force-expire invoice Xendit milik store (mis. saat
// admin store membatalkan order yang belum dibayar). Jalur sama dgn create:
// X-Internal-Key store; Xendit dipanggil dgn key master (atau for-user-id bila LIVE).
//
//	POST /api/client-store-invoices/:id/expire
//	Header: X-Internal-Key: <internal_key store>
func ExpireClientStoreInvoice(c fiber.Ctx) error {
	got := c.Get("X-Internal-Key")
	invoiceID := c.Params("id")
	if got == "" || invoiceID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "missing X-Internal-Key / invoice id"})
	}
	var store model.ClientStore
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1").Find(&stores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "db error"})
	}
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

	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return c.Status(400).JSON(fiber.Map{"error": "xendit_secret_key belum dikonfigurasi"})
	}

	req, err := http.NewRequest(http.MethodPost,
		"https://api.xendit.co/v2/invoices/"+invoiceID+"/expire!", nil)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	if store.SubAccountID != "" && strings.EqualFold(store.KYCStatus, "LIVE") {
		req.Header.Set("for-user-id", store.SubAccountID)
	}
	resp, err := (&http.Client{Timeout: 20 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "xendit unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)

	var out any
	if json.Unmarshal(raw, &out) != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad xendit response"})
	}
	return c.Status(resp.StatusCode).JSON(out)
}


// RefundClientStoreInvoice — refund pembayaran Xendit milik store lewat hub
// (X-Internal-Key store → Xendit dgn key master / for-user-id bila LIVE).
//
//	POST /api/client-store-refunds
//	Body: {"payment_id":"...","amount":150000,"currency":"IDR","reason":"USER_REQUEST","reference_id":"mg-refund-MG-..."}
func RefundClientStoreInvoice(c fiber.Ctx) error {
	got := c.Get("X-Internal-Key")
	if got == "" {
		return c.Status(401).JSON(fiber.Map{"error": "missing X-Internal-Key"})
	}
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1").Find(&stores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "db error"})
	}
	found := false
	var store model.ClientStore
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
	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return c.Status(400).JSON(fiber.Map{"error": "xendit_secret_key belum dikonfigurasi"})
	}
	var in struct {
		PaymentID   string `json:"payment_id"`
		InvoiceID   string `json:"invoice_id"`
		Amount      int    `json:"amount"`
		Currency    string `json:"currency"`
		Reason      string `json:"reason"`
		ReferenceID string `json:"reference_id"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "payment_id (atau invoice_id) & amount wajib"})
	}
	// Catatan: GET /v1/invoices/{id} tidak tersedia (404) di akun ini, jadi
	// refund TIDAK bergantung pada payment_id — cukup invoice_id (API baru).
	if in.InvoiceID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "invoice_id wajib untuk refund"})
	}
	if in.Currency == "" {
		in.Currency = "IDR"
	}
	// Normalisasi reason ke enum yang sah milik Xendit.
	switch strings.ToUpper(strings.TrimSpace(in.Reason)) {
	case "FRAUDULENT", "DUPLICATE", "REQUESTED_BY_CUSTOMER", "CANCELLATION", "OTHERS":
		in.Reason = strings.ToUpper(strings.TrimSpace(in.Reason))
	default:
		in.Reason = "REQUESTED_BY_CUSTOMER"
	}
	// Xendit Refunds API (baru) wajib: invoice_id atau payment_request_id.
	if in.InvoiceID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "invoice_id wajib untuk refund"})
	}
	payload := map[string]interface{}{
		"invoice_id":   in.InvoiceID,
		"amount":       in.Amount,
		"currency":     in.Currency,
		"reason":       in.Reason,
		"reference_id": in.ReferenceID,
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/refunds", bytes.NewReader(body))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	if store.SubAccountID != "" && strings.EqualFold(store.KYCStatus, "LIVE") {
		req.Header.Set("for-user-id", store.SubAccountID)
	}
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "xendit unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	var out any
	if json.Unmarshal(raw, &out) != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad xendit response"})
	}
	return c.Status(resp.StatusCode).JSON(out)
}
