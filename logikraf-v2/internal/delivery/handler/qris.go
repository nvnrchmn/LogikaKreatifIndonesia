package handler

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	paymenthub "github.com/logikraf/logikraf-v2/internal/service"
)

// ============================================================================
// QRIS kustom — halaman bayar sendiri (bukan hosted page Xendit).
// Dibuat via Xendit Payment Requests API (QR_CODE / QRIS, one-time use).
//
// Alur:
//   POST /api/payment/qris                      → buat QRIS (reference_id, qr_string)
//   GET  /api/payment/qris/:reference           → status (polling fallback)
//   GET  /api/payment/qris/:reference/stream    → SSE realtime (push status)
//   POST /api/payment/qris/:reference/simulate  → MODE TES: tandai sudah dibayar
//   POST /api/webhooks/xendit/qris              → webhook Xendit (payment_request.*)
//
// Mode tes/live diatur env QRIS_MODE (default "test") + key di settings:
//   test → settings `xendit_secret_key_sandbox` (fallback env XENDIT_SANDBOX_KEY)
//   live → settings `xendit_secret_key`
// ============================================================================

var qrisHTTP = &http.Client{Timeout: 30 * time.Second}

const xenditAPIVersion = "2024-11-11"

// markOrderPaidByExternalID — kalau pembayaran QRIS ini terhubung ke order LKI
// (external_id = order_number), tandai order tsb lunas.
func markOrderPaidByExternalID(externalID string) {
	if externalID == "" {
		return
	}
	// Order dijamin ada (dibuat sejak checkout), lalu ditandai lunas + notifikasi.
	var qp model.QrisPayment
	if e := model.DB.Where("external_id = ?", externalID).Order("id desc").First(&qp).Error; e == nil {
		ensureOrderForQris(&qp)
		return
	}
	res := model.DB.Model(&model.Order{}).
		Where("order_number = ? AND status <> ?", externalID, "paid").
		Update("status", "paid")
	if res.Error != nil {
		log.Printf("[qris] gagal tandai order %s lunas: %v", externalID, res.Error)
		return
	}
	if res.RowsAffected > 0 {
		log.Printf("[qris] order %s ditandai PAID via QRIS", externalID)
	}
}

// qrisSimulateAllowed — tombol simulasi hanya muncul kalau memang mode tes.
func qrisSimulateAllowed() bool {
	return qrisMode() == "test" || strings.EqualFold(os.Getenv("QRIS_ALLOW_SIMULATE"), "true")
}

func qrisMode() string {
	m := strings.ToLower(strings.TrimSpace(os.Getenv("QRIS_MODE")))
	if m == "" {
		return "test"
	}
	return m
}

func qrisSecret() string {
	if qrisMode() == "live" {
		return setting("xendit_secret_key", "logikraf")
	}
	if k := setting("xendit_secret_key_sandbox", "logikraf"); k != "" {
		return k
	}
	return os.Getenv("XENDIT_SANDBOX_KEY")
}

func qrisBasicAuth(secret string) string {
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(secret+":"))
}

func randomRef(prefix string) string {
	b := make([]byte, 6)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%s-%s-%s", prefix, time.Now().Format("20060102"), strings.ToUpper(hex.EncodeToString(b)))
}

// qrisSyncFromProvider — tarik status terbaru dari Xendit (kalau masih pending).
func qrisSyncFromProvider(p *model.QrisPayment) {
	if p.ProviderID == "" || p.Status != "pending" {
		return
	}
	secret := qrisSecret()
	if secret == "" {
		return
	}
	req, err := http.NewRequest(http.MethodGet, "https://api.xendit.co/payment_requests/"+p.ProviderID, nil)
	if err != nil {
		return
	}
	req.Header.Set("Authorization", qrisBasicAuth(secret))
	req.Header.Set("api-version", xenditAPIVersion)
	resp, err := qrisHTTP.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	var d struct {
		Status string `json:"status"`
	}
	if json.Unmarshal(raw, &d) != nil || d.Status == "" {
		return
	}
	qrisApplyStatus(p, d.Status, "")
}

// qrisApplyStatus — update DB + publish ke SSE kalau status berubah.
func qrisApplyStatus(p *model.QrisPayment, providerStatus, payer string) {
	newStatus := ""
	switch strings.ToUpper(providerStatus) {
	case "SUCCEEDED", "PAID", "SETTLED":
		newStatus = "paid"
	case "EXPIRED":
		newStatus = "expired"
	case "FAILED", "CANCELED", "CANCELLED":
		newStatus = "failed"
	case "PENDING", "REQUIRES_ACTION", "AWAITING_CAPTURE":
		newStatus = "pending"
	}
	if newStatus == "" || newStatus == p.Status {
		return
	}
	updates := map[string]interface{}{"status": newStatus}
	if newStatus == "paid" {
		now := time.Now()
		updates["paid_at"] = now
		if payer != "" {
			updates["payer_name"] = payer
		}
	}
	if err := model.DB.Model(&model.QrisPayment{}).Where("reference_id = ?", p.ReferenceID).Updates(updates).Error; err != nil {
		log.Printf("[qris] gagal update status %s: %v", p.ReferenceID, err)
		return
	}
	p.Status = newStatus
	if newStatus == "paid" {
		now := time.Now()
		p.PaidAt = &now
	}
	log.Printf("[qris] %s → %s", p.ReferenceID, newStatus)
	qrisPublishSnapshot(p)
	// Kalau QRIS ini milik order LKI (external_id = order_number), tandai lunas.
	if newStatus == "paid" {
		markOrderPaidByExternalID(p.ExternalID)
	}
}

func qrisPublishSnapshot(p *model.QrisPayment) {
	b, err := json.Marshal(fiber.Map{
		"reference_id": p.ReferenceID,
		"status":       p.Status,
		"amount":       p.Amount,
		"paid_at":      p.PaidAt,
		"external_id":  p.ExternalID,
	})
	if err == nil {
		paymenthub.QrisPublish(p.ReferenceID, string(b))
	}
}

func qrisFind(reference string) (*model.QrisPayment, error) {
	var p model.QrisPayment
	if err := model.DB.Where("reference_id = ?", reference).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

// CreateQrisPayment — buat QRIS baru (dipakai checkout LKI / store).
func CreateQrisPayment(c fiber.Ctx) error {
	var in struct {
		ExternalID  string `json:"external_id"`
		OrderID     string `json:"order_id"`
		Amount      int    `json:"amount"`
		Description string `json:"description"`
		PayerName   string `json:"payer_name"`
		PayerEmail  string `json:"payer_email"`
		PayerPhone  string `json:"payer_phone"`
		ExpiresIn   int    `json:"expires_in_minutes"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Amount <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "amount wajib (> 0)"})
	}
	secret := qrisSecret()
	if secret == "" {
		return c.Status(503).JSON(fiber.Map{"error": "Xendit key untuk mode " + qrisMode() + " belum dikonfigurasi"})
	}
	ref := randomRef("QRIS")
	if in.Description == "" {
		in.Description = "Pembayaran Logikraf"
	}
	body, _ := json.Marshal(map[string]interface{}{
		"reference_id": ref,
		"amount":       in.Amount,
		"currency":     "IDR",
		"description":  in.Description,
		"payment_method": map[string]interface{}{
			"type":        "QR_CODE",
			"reusability": "ONE_TIME_USE",
			"qr_code":     map[string]interface{}{"channel_code": "QRIS"},
		},
	})
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/payment_requests", bytes.NewReader(body))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Authorization", qrisBasicAuth(secret))
	req.Header.Set("api-version", xenditAPIVersion)
	req.Header.Set("Content-Type", "application/json")
	resp, err := qrisHTTP.Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "xendit unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		log.Printf("[qris] create gagal (%d): %s", resp.StatusCode, strings.TrimSpace(string(raw)))
		return c.Status(resp.StatusCode).JSON(fiber.Map{"error": "xendit: " + strings.TrimSpace(string(raw))})
	}
	var out struct {
		ID            string `json:"id"`
		Status        string `json:"status"`
		ReferenceID   string `json:"reference_id"`
		PaymentMethod struct {
			QRCode struct {
				ChannelProperties struct {
					QRString string `json:"qr_string"`
				} `json:"channel_properties"`
			} `json:"qr_code"`
		} `json:"payment_method"`
		Actions []struct {
			Type  string `json:"type"`
			Value string `json:"value"`
		} `json:"actions"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad xendit response"})
	}
	// QR string Xendit ada di payment_method.qr_code.channel_properties.qr_string;
	// actions[] hanya dipakai kalau bentuk respons berubah.
	qrString := strings.TrimSpace(out.PaymentMethod.QRCode.ChannelProperties.QRString)
	for _, a := range out.Actions {
		if strings.EqualFold(a.Type, "QR_CODE") && a.Value != "" {
			qrString = a.Value
			break
		}
	}
	exp := time.Now().Add(15 * time.Minute)
	if in.ExpiresIn > 0 {
		exp = time.Now().Add(time.Duration(in.ExpiresIn) * time.Minute)
	}
	if in.ExternalID == "" {
		in.ExternalID = ref
	}
	p := model.QrisPayment{
		ReferenceID: in.ExternalID,
		ExternalID:  in.ExternalID,
		ClientName:  in.PayerName,
		ClientEmail: in.PayerEmail,
		ClientPhone: in.PayerPhone,
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
	if p.ReferenceID == "" {
		p.ReferenceID = ref
	}
	if pid, pname := packageFromOrderRef(in.OrderID); pid > 0 {
		p.PackageID, p.PackageName = pid, pname
	}
	if err := model.DB.Create(&p).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal simpan pembayaran"})
	}
	// Tampilkan pesanan di panel admin sejak checkout (status pending).
	ensurePendingOrderForQris(&p)
	return c.Status(201).JSON(fiber.Map{
		"reference_id":     p.ReferenceID,
		"provider_id":      p.ProviderID,
		"pay_url":          "https://" + c.Host() + "/pay/qris/" + p.ReferenceID,
		"qr_string":        p.QrString,
		"simulate_allowed": qrisSimulateAllowed() && p.Mode != "live",
		"amount":           p.Amount,
		"currency":         p.Currency,
		"status":           p.Status,
		"mode":             p.Mode,
		"expires_at":       p.ExpiresAt,
		"stream_url":       "/api/payment/qris/" + p.ReferenceID + "/stream",
	})
}

// GetQrisPaymentStatus — status pembayaran (dipakai polling & halaman sukses).
func GetQrisPaymentStatus(c fiber.Ctx) error {
	p, err := qrisFind(c.Params("reference"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "pembayaran tidak ditemukan"})
	}
	qrisSyncFromProvider(p)
	return c.JSON(fiber.Map{
		"reference_id":     p.ReferenceID,
		"external_id":      p.ExternalID,
		"status":           p.Status,
		"amount":           p.Amount,
		"currency":         p.Currency,
		"mode":             p.Mode,
		"qr_string":        p.QrString,
		"simulate_allowed": qrisSimulateAllowed() && p.Mode != "live",
		"expires_at":       p.ExpiresAt,
		"paid_at":          p.PaidAt,
		"payer_name":       p.PayerName,
	})
}

// SimulateQrisPayment — MODE TES: tandai pembayaran sukses.
// Coba simulate di Xendit dulu (test mode), kalau tidak didukung → simulator
// internal supaya pipeline webhook/realtime tetap bisa diuji.
func SimulateQrisPayment(c fiber.Ctx) error {
	p, err := qrisFind(c.Params("reference"))
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "pembayaran tidak ditemukan"})
	}
	if p.Status == "paid" {
		return c.JSON(fiber.Map{"status": "paid", "note": "sudah dibayar"})
	}
	xenditOK := false
	if secret := qrisSecret(); secret != "" && p.ProviderID != "" {
		req, err2 := http.NewRequest(http.MethodPost, "https://api.xendit.co/payment_requests/"+p.ProviderID+"/payments/simulate", bytes.NewReader([]byte("{}")))
		if err2 == nil {
			req.Header.Set("Authorization", qrisBasicAuth(secret))
			req.Header.Set("api-version", xenditAPIVersion)
			req.Header.Set("Content-Type", "application/json")
			if r, err3 := qrisHTTP.Do(req); err3 == nil {
				io.Copy(io.Discard, r.Body)
				r.Body.Close()
				xenditOK = r.StatusCode < 300
				if !xenditOK {
					log.Printf("[qris] simulate xendit gagal (%d) — pakai simulator internal", r.StatusCode)
				}
			}
		}
	}
	if !xenditOK {
		// Simulator internal hanya boleh saat mode tes / env izin eksplisit
		// (jangan sampai QRIS nyata ditandai lunas tanpa uang masuk).
		// Pembayaran mode live TIDAK boleh ditandai lunas oleh simulator internal.
		allowed := (qrisMode() == "test" || strings.EqualFold(os.Getenv("QRIS_ALLOW_SIMULATE"), "true")) && p.Mode != "live"
		if !allowed {
			return c.Status(403).JSON(fiber.Map{"error": "simulasi hanya untuk mode tes (set QRIS_MODE=test atau QRIS_ALLOW_SIMULATE=true)"})
		}
		qrisApplyStatus(p, "SUCCEEDED", "Simulator (mode tes)")
	}
	qrisSyncFromProvider(p)
	fresh, _ := qrisFind(p.ReferenceID)
	return c.JSON(fiber.Map{"status": fresh.Status, "xendit_simulated": xenditOK, "mode": fresh.Mode})
}

// QrisPaymentStream — SSE realtime status pembayaran.
func QrisPaymentStream(c fiber.Ctx) error {
	reference := c.Params("reference")
	if _, err := qrisFind(reference); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "pembayaran tidak ditemukan"})
	}
	ch, unsub := paymenthub.QrisSubscribe(reference)
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("X-Accel-Buffering", "no") // nginx: jangan buffer SSE

	return c.SendStreamWriter(func(w *bufio.Writer) {
		send := func(event, payload string) {
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, payload)
			w.Flush()
		}
		terminal := func() bool {
			p, err := qrisFind(reference)
			return err == nil && (p.Status == "paid" || p.Status == "expired" || p.Status == "failed")
		}
		defer unsub()
		if p, err := qrisFind(reference); err == nil {
			b, _ := json.Marshal(fiber.Map{"reference_id": p.ReferenceID, "status": p.Status, "amount": p.Amount})
			send("status", string(b))
			if p.Status == "paid" || p.Status == "expired" || p.Status == "failed" {
				send("done", `{"close":true}`)
				return
			}
		}
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		deadline := time.After(10 * time.Minute)
		for {
			select {
			case msg, ok := <-ch:
				if !ok {
					return
				}
				send("status", msg)
				if terminal() {
					send("done", `{"close":true}`)
					return
				}
			case <-ticker.C:
				fmt.Fprint(w, ": keep-alive\n\n")
				w.Flush()
				if terminal() {
					send("done", `{"close":true}`)
					return
				}
			case <-deadline:
				send("done", `{"timeout":true}`)
				return
			}
		}
	})
}

// XenditQrisWebhook — callback Xendit untuk pembayaran QRIS
// (event: payment_request.succeeded / qr.payment / payment_request.expired).
func XenditQrisWebhook(c fiber.Ctx) error {
	raw := c.Body()
	token := c.Get("X-Callback-Token")
	expected := setting("xendit_webhook_token", "logikraf")
	if expected == "" {
		expected = os.Getenv("XENDIT_WEBHOOK_TOKEN")
	}
	if expected != "" && token != expected {
		log.Printf("[qris-webhook] callback token tidak cocok")
		return c.Status(401).JSON(fiber.Map{"error": "invalid callback token"})
	}
	var p struct {
		Event string `json:"event"`
		Data  struct {
			ID            string `json:"id"`
			ReferenceID   string `json:"reference_id"`
			Status        string `json:"status"`
			PayerName     string `json:"payer_name"`
			PaymentMethod struct {
				ReferenceID string `json:"reference_id"`
			} `json:"payment_method"`
		} `json:"data"`
		ReferenceID string `json:"reference_id"`
		Status      string `json:"status"`
	}
	if err := json.Unmarshal(raw, &p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid json"})
	}
	ref := p.Data.ReferenceID
	if ref == "" {
		ref = p.ReferenceID
	}
	if ref == "" {
		ref = p.Data.PaymentMethod.ReferenceID
	}
	status := p.Data.Status
	if status == "" {
		status = p.Status
	}
	if strings.Contains(p.Event, "succeeded") && status == "" {
		status = "SUCCEEDED"
	}
	if ref == "" {
		log.Printf("[qris-webhook] event %s tanpa reference_id — dilewati", p.Event)
		return c.JSON(fiber.Map{"received": true, "matched": false})
	}
	row, err := qrisFind(ref)
	if err != nil {
		log.Printf("[qris-webhook] referensi %s tidak dikenal (event %s)", ref, p.Event)
		return c.JSON(fiber.Map{"received": true, "matched": false})
	}
	qrisApplyStatus(row, status, p.Data.PayerName)
	return c.JSON(fiber.Map{"received": true, "matched": true, "status": row.Status})
}

// --- helper kecil untuk dipakai modul lain (checkout order LKI) ---

// QrisMarkPaidByExternal dipakai saat webhook order/invoice lain menandai lunas.
func QrisMarkPaidByExternal(externalID, payer string) {
	var rows []model.QrisPayment
	if err := model.DB.Where("external_id = ? AND status = ?", externalID, "pending").Find(&rows).Error; err != nil {
		return
	}
	for i := range rows {
		qrisApplyStatus(&rows[i], "SUCCEEDED", payer)
	}
}
