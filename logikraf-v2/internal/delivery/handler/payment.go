package handler

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
	"github.com/logikraf/logikraf-v2/pkg/email"
)

func isWebhookProcessed(webhookID, provider string) bool {
	var count int64
	model.DB.Model(&model.ProcessedWebhook{}).Where("webhook_id = ? AND provider = ?", webhookID, provider).Count(&count)
	return count > 0
}

func markWebhookProcessed(webhookID, provider string) {
	model.DB.Create(&model.ProcessedWebhook{
		WebhookID: webhookID,
		Provider:  provider,
		CreatedAt: time.Now(),
	})
}

func setting(key, tenant string) string {
	var s model.Setting
	if err := model.DB.Where("tenant = ? AND `key` = ?", tenant, key).First(&s).Error; err == nil {
		return s.Value
	}
	if tenant != "logikraf" {
		if err := model.DB.Where("tenant = ? AND `key` = ?", "logikraf", key).First(&s).Error; err == nil {
			return s.Value
		}
	}
	return ""
}

// tenantOf resolves the tenant from the request Host (strips port and www.).
func tenantOf(c fiber.Ctx) string {
	h := c.Host()
	if i := strings.Index(h, ":"); i >= 0 {
		h = h[:i]
	}
	h = strings.TrimPrefix(h, "www.")
	if h == "" {
		return "logikraf"
	}
	return h
}

type xenditInvoiceRequest struct {
	ExternalID  string `json:"external_id"`
	OrderID     string `json:"order_id"` // alias dari CheckoutModal (format iPaymu)
	Amount      uint   `json:"amount"`
	PayerEmail  string `json:"payer_email"`
	Email       string `json:"email"` // alias dari CheckoutModal
	ClientName  string `json:"first_name"`
	ClientPhone string `json:"phone"`
	Description string `json:"description"`
}

// normalized maps CheckoutModal-style payload (order_id/email/first_name/phone)
// onto the Xendit invoice fields so both gateway payloads share one shape.
func (x *xenditInvoiceRequest) normalized() {
	if x.ExternalID == "" {
		x.ExternalID = x.OrderID
	}
	if x.PayerEmail == "" {
		x.PayerEmail = x.Email
	}
}

// CreateXenditInvoice proxies an invoice creation to Xendit.
func CreateXenditInvoice(c fiber.Ctx) error {
	tenant := tenantOf(c)
	secret := setting("xendit_secret_key", tenant)
	if secret == "" {
		return c.Status(400).JSON(fiber.Map{"error": "xendit_secret_key not configured"})
	}

	var in xenditInvoiceRequest
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	in.normalized()
	if in.ExternalID == "" || in.Amount == 0 || in.PayerEmail == "" {
		return c.Status(400).JSON(fiber.Map{"error": "external_id, amount, payer_email required"})
	}

	// Payload resmi Xendit v2 — field ekstra (payment_method/channel) tidak dikirim.
	bodyMap := map[string]any{
		"external_id":          in.ExternalID,
		"amount":               in.Amount,
		"payer_email":          in.PayerEmail,
		"description":          orDefault(in.Description, "Logikraf Package"),
		"currency":             "IDR",
		"success_redirect_url": "https://" + c.Host() + "/paket?status=success",
		"failure_redirect_url": "https://" + c.Host() + "/paket",
	}
	body, _ := json.Marshal(bodyMap)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/v2/invoices", bytes.NewReader(body))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))

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
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var acc model.TenantPaymentAccount
		model.DB.Where("tenant_id = ? AND provider = ?", tenant, "xendit").FirstOrCreate(&acc, model.TenantPaymentAccount{TenantID: tenant, Provider: "xendit"})
		acc.Status = "ACTIVE"
		if err := model.DB.Save(&acc).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
		gross := in.Amount
		providerFee := calcFee(gross, setting("xendit_fee_percent", tenant), setting("xendit_fee_flat", tenant))
		platformFee := calcFee(gross, setting("platform_fee_percent", tenant), "")
		outMap, _ := out.(map[string]any)
		// OrderID = external_id (order number) — dipakai lookup webhook & update Order.
		// ProviderTxID = invoice id Xendit.
		providerTxID := ""
		if id, ok := outMap["id"].(string); ok {
			providerTxID = id
		}
		model.DB.Create(&model.PaymentTransaction{
			TenantID:         tenant,
			PaymentAccountID: acc.ID,
			InvoiceRef:       in.Description,
			Provider:         "xendit",
			OrderID:          in.ExternalID,
			ClientName:       in.ClientName,
			ClientEmail:      in.PayerEmail,
			ClientPhone:      in.ClientPhone,
			ProviderTxID:     providerTxID,
			GrossAmount:      gross,
			ProviderFee:      providerFee,
			PlatformFee:      platformFee,
			NetAmount:        gross - providerFee - platformFee,
			Status:           "pending",
		})
	}
	return c.Status(resp.StatusCode).JSON(out)
}

// CreateMidtransSnap creates a Snap transaction and returns the redirect_url
// the frontend opens to complete payment. Auth uses the Midtrans Server Key.
func CreateMidtransSnap(c fiber.Ctx) error {
	serverKey := setting("midtrans_server_key", tenantOf(c))
	if serverKey == "" {
		return c.Status(400).JSON(fiber.Map{"error": "midtrans_server_key not configured"})
	}

	baseURL := "https://app.midtrans.com"
	if setting("midtrans_env", tenantOf(c)) == "sandbox" {
		baseURL = "https://app.sandbox.midtrans.com"
	}

	var in struct {
		OrderID     string `json:"order_id"`
		Amount      uint   `json:"amount"`
		FirstName   string `json:"first_name"`
		Email       string `json:"email"`
		Phone       string `json:"phone"`
		Description string `json:"description"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if in.Amount == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "amount required"})
	}
	if in.OrderID == "" {
		in.OrderID = "LK-" + time.Now().Format("20060102150405") + "-" + randSuffix()
	}

	body, _ := json.Marshal(map[string]any{
		"transaction_details": map[string]any{
			"order_id":     in.OrderID,
			"gross_amount": in.Amount,
		},
		"item_details": []map[string]any{
			{
				"id":       in.OrderID,
				"price":    in.Amount,
				"quantity": 1,
				"name":     orDefault(in.Description, "Logikraf Package"),
			},
		},
		"customer_details": map[string]any{
			"first_name": orDefault(in.FirstName, "Customer"),
			"email":      orDefault(in.Email, "customer@example.com"),
			"phone":      in.Phone,
		},
		"callbacks": map[string]any{
			"finish_redirect_url": "https://" + c.Host() + "/paket?status=success",
		},
	})

	req, err := http.NewRequest(http.MethodPost, baseURL+"/snap/v1/transactions", bytes.NewReader(body))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(serverKey+":")))

	resp, err := (&http.Client{Timeout: 20 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "midtrans unreachable"})
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	var out map[string]any
	if json.Unmarshal(raw, &out) != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad midtrans response"})
	}
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		tenant := tenantOf(c)
		// upsert tenant payment account as ACTIVE (merchant configured)
		var acc model.TenantPaymentAccount
		model.DB.Where("tenant_id = ? AND provider = ?", tenant, "midtrans").FirstOrCreate(&acc, model.TenantPaymentAccount{TenantID: tenant, Provider: "midtrans"})
		acc.Status = "ACTIVE"
		if err := model.DB.Save(&acc).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
		// ledger entry
		gross := in.Amount
		providerFee := calcFee(gross, setting("midtrans_fee_percent", tenantOf(c)), setting("midtrans_fee_flat", tenantOf(c)))
		platformFee := calcFee(gross, setting("platform_fee_percent", tenantOf(c)), "")
		pt := model.PaymentTransaction{
			TenantID:         tenant,
			PaymentAccountID: acc.ID,
			InvoiceRef:       in.Description,
			Provider:         "midtrans",
			OrderID:          in.OrderID,
			ClientName:       in.FirstName,
			ClientEmail:      in.Email,
			ClientPhone:      in.Phone,
			GrossAmount:      gross,
			ProviderFee:      providerFee,
			PlatformFee:      platformFee,
			NetAmount:        gross - providerFee - platformFee,
			Status:           "pending",
		}
		if tok, ok := out["token"].(string); ok {
			pt.ProviderTxID = tok
		}
		if err := model.DB.Create(&pt).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
	}
	return c.Status(resp.StatusCode).JSON(out)
}

func orDefault(v, def string) string {
	if v == "" {
		return def
	}
	return v
}

func randSuffix() string {
	return strconv.FormatInt(time.Now().UnixNano()%100000, 10)
}

// calcFee computes percent+flat fee from string settings. Pass flat="" for no flat component.
// ponytail: percent parsed as float (handles "2.9"); flat as integer rupiah. No rounding surprises beyond truncation.
func calcFee(gross uint, percentStr, flatStr string) uint {
	var pct float64
	if percentStr != "" {
		if v, err := strconv.ParseFloat(percentStr, 64); err == nil {
			pct = v
		}
	}
	var flat uint64
	if flatStr != "" {
		if v, err := strconv.ParseUint(flatStr, 10, 64); err == nil {
			flat = v
		}
	}
	fee := uint(float64(gross)*pct/100.0) + uint(flat)
	return fee
}

// upsertTransaction records a settled payment keyed by its gateway reference.
func upsertTransaction(ref, method, status string, amount uint) {
	var tx model.Transaction
	err := model.DB.Where("transaction_reference = ?", ref).First(&tx).Error
	settled := status == "settled"
	now := time.Now()

	tx.TransactionReference = ref
	tx.PaymentMethod = method
	tx.Status = status
	if amount > 0 {
		tx.Amount = amount
	}
	if settled {
		tx.SettledAt = &now
	}
	if err != nil {
		if err := model.DB.Create(&tx).Error; err != nil {
			return
		}
		return
	}
	if err := model.DB.Save(&tx).Error; err != nil {
		return
	}
}

// XenditWebhook handles Xendit invoice callbacks.
func XenditWebhook(c fiber.Ctx) error {
	got := c.Get("X-Callback-Token")
	tenant := ""
	if got != "" {
		var s model.Setting
		if err := model.DB.Where("`key` = ? AND value = ?", "xendit_webhook_token", got).First(&s).Error; err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		tenant = s.Tenant
	}

	var p struct {
		ExternalID string `json:"external_id"`
		ID         string `json:"id"`
		Status     string `json:"status"`
		Amount     uint   `json:"amount"`
	}
	if err := c.Bind().JSON(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}

	// XenPlatform payout events (v3): body tidak punya external_id invoice —
	// ciri: ada reference_id berprefix "pt-". Payment Hub meneruskan mentah ke
	// logikraf-partners utk update status payout + notif WA mitra.
	if p.ExternalID == "" && strings.Contains(string(c.Body()), "reference_id") && strings.Contains(string(c.Body()), "pt-") {
		return forwardPayoutToPartners(c)
	}

	// XenPlatform account events (verification / suspension / created):
	// ciri: body punya account_id/business_id tanpa external_id invoice →
	// cocokkan sub_account_id, update kyc_status store, notif WA via partners.
	if p.ExternalID == "" && isAccountEvent(string(c.Body())) {
		return handleAccountEventWebhook(c)
	}

	// Payment Hub routing: kalau external_id punya prefix client store aktif
	// (mis. "mg-") → forward seluruh payload ke webhook store.
	handled, ferr := ForwardToClientStore(c, p.ExternalID)
	if ferr != nil {
		return c.Status(502).JSON(fiber.Map{"error": "forward ke client store gagal", "detail": ferr.Error()})
	}
	if handled {
		return c.JSON(fiber.Map{"status": "ok", "message": "forwarded to client store"})
	}

	ref := p.ExternalID
	if ref == "" {
		ref = p.ID
	}
	if ref == "" {
		return c.Status(400).JSON(fiber.Map{"error": "missing reference"})
	}

	// Idempotency: skip jika event (invoice+status) sudah diproses.
	webhookID := p.ID + ":" + p.Status
	if webhookID != "" && isWebhookProcessed(webhookID, "xendit") {
		return c.JSON(fiber.Map{"status": "ok", "message": "already processed"})
	}

	if p.Status == "PAID" {
		now := time.Now()
		q := model.DB.Where("order_id = ?", ref)
		if tenant != "" {
			q = q.Where("tenant_id = ?", tenant)
		}
		var pt model.PaymentTransaction
		if err := q.First(&pt).Error; err == nil {
			if tenant == "" {
				tenant = pt.TenantID
			}
			pt.Status = "settled"
			pt.SettledAt = &now
			if err := model.DB.Save(&pt).Error; err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "failed"})
			}

			// Find the Order record (dibuat via CreateOrderFromPayment atau manual)
			var order model.Order
			orderID := uint(0)
			if err := model.DB.Where("order_number = ?", ref).First(&order).Error; err == nil {
				orderID = order.ID
			}

			txRef := pt.ProviderTxID
			if txRef == "" {
				txRef = ref
			}
			// Auto-create Transaction (ledger entry)
			tx := model.Transaction{
				OrderID:              orderID,
				TransactionReference: txRef,
				MilestoneName:        pt.InvoiceRef,
				Amount:               pt.GrossAmount,
				PaymentMethod:        pt.Provider,
				Status:               "settled",
				SettledAt:            &now,
			}
			model.DB.Create(&tx)

			// Auto-create Invoice (receipt). PaidAmount = full amount (QRIS/VA
			// settlement adalah uang sudah diterima).
			if orderID > 0 && len(txRef) >= 8 {
				inv := model.Invoice{
					OrderID:       &orderID,
					InvoiceNumber: "INV-" + txRef[:8] + "-" + strconv.FormatInt(now.Unix(), 10),
					Type:          "receipt",
					Total:         pt.GrossAmount,
					PaidAmount:    pt.GrossAmount,
					Status:        "paid",
					IssueDate:     &now,
					DueDate:       &now,
				}
				model.DB.Create(&inv)
			}

			// Notification utk admin
			notif := model.Notification{
				TenantID: tenant,
				Type:     "payment_settled",
				Title:    "Pembayaran Diterima: " + pt.InvoiceRef,
				Message:  "Pembayaran " + pt.Provider + " sebesar Rp " + strconv.Itoa(int(pt.GrossAmount)) + " dari " + pt.ClientName + " (" + pt.ClientEmail + ") telah diterima. Buat project sekarang?",
				RefTable: "payment_transactions",
				RefID:    pt.ID,
			}
			model.DB.Create(&notif)

			// Email receipt ke client (async, jangan gagalkan webhook)
			go func() {
				cfg := email.DefaultConfig()
				if cfg.Host != "" {
					_ = email.SendPaymentReceipt(cfg, pt.ClientEmail, pt.ClientName, pt.InvoiceRef, strconv.Itoa(int(pt.GrossAmount)), txRef)
				}
			}()

			markWebhookProcessed(webhookID, "xendit")
		}
		model.DB.Model(&model.Order{}).Where("order_number = ?", ref).Update("status", "paid")
		notifySBDigital(ref, "SETTLED")
	}
	return c.JSON(fiber.Map{"status": "ok"})
}

// MidtransWebhook handles Midtrans notifications, verifying the signature key.
func MidtransWebhook(c fiber.Ctx) error {
	var p struct {
		OrderID           string `json:"order_id"`
		StatusCode        string `json:"status_code"`
		GrossAmount       string `json:"gross_amount"`
		SignatureKey      string `json:"signature_key"`
		TransactionStatus string `json:"transaction_status"`
	}
	if err := c.Bind().JSON(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}

	// Midtrans webhook has no tenant in the Host; resolve tenant by verifying
	// the signature against each configured server key.
	var tenants []model.Setting
	model.DB.Where("`key` = ? AND value != ?", "midtrans_server_key", "").Find(&tenants)
	serverKey := ""
	tenant := ""
	for _, t := range tenants {
		sum := sha512.Sum512([]byte(p.OrderID + p.StatusCode + p.GrossAmount + t.Value))
		if subtle.ConstantTimeCompare([]byte(hex.EncodeToString(sum[:])), []byte(p.SignatureKey)) == 1 {
			serverKey = t.Value
			tenant = t.Tenant
			break
		}
	}
	if serverKey == "" {
		return c.Status(401).JSON(fiber.Map{"error": "bad signature"})
	}

	status := "pending"
	now := time.Now()
	switch p.TransactionStatus {
	case "settlement", "capture":
		status = "settled"
	case "deny", "cancel", "expire", "failure":
		status = "failed"
	}

	// update per-tenant ledger
	var pt model.PaymentTransaction
	if err := model.DB.Where("order_id = ? AND tenant_id = ?", p.OrderID, tenant).First(&pt).Error; err == nil {
		pt.Status = status
		if status == "settled" {
			pt.SettledAt = &now
		}
		if err := model.DB.Save(&pt).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
	}
	// legacy generic ledger (kept for backward compat with old orders)
	upsertTransaction(p.OrderID, "midtrans", status, 0)
	if status == "settled" {
		notifySBDigital(p.OrderID, "SETTLED")
	}
	return c.JSON(fiber.Map{"status": "ok"})
}

// notifySBDigital forwards a settled payment back to the SB Digital SaaS webhook
// so its invoices/subscriptions get marked paid. ponytail: single tenant target
// via settings; fan-out to multiple SaaS apps if more tenants onboard.
func notifySBDigital(externalID, status string) {
	url := setting("sbdigital_webhook_url", "logikraf")
	secret := setting("sbdigital_webhook_secret", "logikraf")
	if url == "" {
		return
	}
	body, _ := json.Marshal(map[string]string{"external_id": externalID, "status": status})
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	if secret != "" {
		req.Header.Set("X-Logikraf-Signature", secret)
	}
	client := &http.Client{Timeout: 10 * time.Second}
	client.Do(req) // ponytail: fire-and-forget; SB Digital retries on its side
}

// ipaymuSign builds the iPaymu v2 request signature:
// HMAC-SHA256("POST:"+va+":"+sha256(body)+":"+key, key).
func ipaymuSign(va, body, key string) string {
	hb := sha256.Sum256([]byte(body))
	bodyHash := hex.EncodeToString(hb[:])
	str := "POST:" + va + ":" + bodyHash + ":" + key
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(str))
	return hex.EncodeToString(mac.Sum(nil))
}

// CreateIpaymuPayment creates a direct iPaymu checkout (Logikraf receives 100%
// of the client payment — no split, since this is Logikraf's own revenue) and
// returns the redirect URL the frontend opens to complete payment.
func CreateIpaymuPayment(c fiber.Ctx) error {
	tenant := tenantOf(c)
	va := setting("ipaymu_master_va", tenant)
	key := setting("ipaymu_master_key", tenant)
	if va == "" || key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ipaymu not configured"})
	}
	env := setting("ipaymu_env", tenant)
	base := "https://my.ipaymu.com"
	if env == "sandbox" {
		base = "https://sandbox.ipaymu.com"
	}

	var in struct {
		OrderID     string `json:"order_id"`
		Amount      uint   `json:"amount"`
		FirstName   string `json:"first_name"`
		Email       string `json:"email"`
		Phone       string `json:"phone"`
		Description string `json:"description"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if in.Amount == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "amount required"})
	}
	if in.OrderID == "" {
		in.OrderID = "LK-" + time.Now().Format("20060102150405") + "-" + randSuffix()
	}

	amountStr := strconv.Itoa(int(in.Amount))
	bodyMap := map[string]any{
		"product":        []string{orDefault(in.Description, "Logikraf Package")},
		"qty":            []string{"1"},
		"price":          []string{amountStr},
		"description":    []string{orDefault(in.Description, "Logikraf Package")},
		"returnUrl":      "https://" + c.Host() + "/paket?status=success",
		"cancelUrl":      "https://" + c.Host() + "/paket",
		"notifyUrl":      "https://" + c.Host() + "/api/webhooks/ipaymu",
		"referenceId":    in.OrderID,
		"buyerName":      in.FirstName,
		"buyerEmail":     in.Email,
		"buyerPhone":     in.Phone,
		"paymentMethod":  "qris",
		"paymentChannel": "qris",
	}
	bodyBytes, _ := json.Marshal(bodyMap)
	sig := ipaymuSign(va, string(bodyBytes), key)

	req, err := http.NewRequest(http.MethodPost, base+"/api/v2/payment", bytes.NewReader(bodyBytes))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("va", va)
	req.Header.Set("signature", sig)

	resp, err := (&http.Client{Timeout: 20 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "ipaymu unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	var out map[string]any
	if json.Unmarshal(raw, &out) != nil {
		return c.Status(502).JSON(fiber.Map{"error": "bad ipaymu response"})
	}
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		var acc model.TenantPaymentAccount
		model.DB.Where("tenant_id = ? AND provider = ?", tenant, "ipaymu").FirstOrCreate(&acc, model.TenantPaymentAccount{TenantID: tenant, Provider: "ipaymu"})
		acc.Status = "ACTIVE"
		if err := model.DB.Save(&acc).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
		gross := in.Amount
		providerFee := calcFee(gross, setting("ipaymu_fee_percent", tenant), setting("ipaymu_fee_flat", tenant))
		platformFee := calcFee(gross, setting("platform_fee_percent", tenant), "")
		pt := model.PaymentTransaction{
			TenantID:         tenant,
			PaymentAccountID: acc.ID,
			InvoiceRef:       in.Description,
			Provider:         "ipaymu",
			OrderID:          in.OrderID,
			ClientName:       in.FirstName,
			ClientEmail:      in.Email,
			ClientPhone:      in.Phone,
			GrossAmount:      gross,
			ProviderFee:      providerFee,
			PlatformFee:      platformFee,
			NetAmount:        gross - providerFee - platformFee,
			Status:           "pending",
		}
		if d, ok := out["Data"].(map[string]any); ok {
			if sid, ok := d["SessionID"].(string); ok {
				pt.ProviderTxID = sid
			}
		}
		if err := model.DB.Create(&pt).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
	}
	return c.Status(resp.StatusCode).JSON(out)
}

// IpaymuWebhook verifies the iPaymu callback signature (HMAC-SHA256 over the
// raw body using the master VA as secret) and settles the matching transaction.
func IpaymuWebhook(c fiber.Ctx) error {
	body := c.Body()
	va := c.Get("va")
	if va == "" {
		return c.Status(400).JSON(fiber.Map{"error": "missing va"})
	}
	var s model.Setting
	if err := model.DB.Where("`key` = ? AND value = ?", "ipaymu_master_va", va).First(&s).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	tenant := s.Tenant
	key := setting("ipaymu_master_key", tenant)
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	if subtle.ConstantTimeCompare([]byte(expected), []byte(c.Get("signature"))) != 1 {
		return c.Status(401).JSON(fiber.Map{"error": "bad signature"})
	}

	var p struct {
		Status      string `json:"status"`
		ReferenceID string `json:"reference_id"`
		TrxID       string `json:"trx_id"`
		SessionID   string `json:"session_id"`
	}
	c.Bind().JSON(&p)

	// Idempotency: skip if this webhook event was already processed
	webhookID := p.TrxID
	if webhookID == "" {
		webhookID = p.SessionID
	}
	if webhookID != "" && isWebhookProcessed(webhookID, "ipaymu") {
		return c.JSON(fiber.Map{"status": "ok", "message": "already processed"})
	}

	if p.Status == "berhasil" && p.ReferenceID != "" {
		now := time.Now()
		var pt model.PaymentTransaction
		if err := model.DB.Where("order_id = ? AND tenant_id = ?", p.ReferenceID, tenant).First(&pt).Error; err == nil {
			pt.Status = "settled"
			pt.SettledAt = &now
			if err := model.DB.Save(&pt).Error; err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "failed"})
			}

			// Find the Order record (created via CreateOrderFromPayment or manually)
			var order model.Order
			orderID := uint(0)
			if err := model.DB.Where("order_number = ?", p.ReferenceID).First(&order).Error; err == nil {
				orderID = order.ID
			}

			// Auto-create Transaction (ledger entry)
			tx := model.Transaction{
				OrderID:              orderID,
				TransactionReference: pt.ProviderTxID,
				MilestoneName:        pt.InvoiceRef,
				Amount:               pt.GrossAmount,
				PaymentMethod:        pt.Provider,
				Status:               "settled",
				SettledAt:            &now,
			}
			model.DB.Create(&tx)

			// Auto-create Invoice (receipt). PaidAmount is set to the full
			// amount because a QRIS settlement is money already received —
			// leaving it at 0 would make a settled payment look outstanding
			// in the receivables report.
			if orderID > 0 {
				inv := model.Invoice{
					OrderID:       &orderID,
					InvoiceNumber: "INV-" + pt.ProviderTxID[:8] + "-" + strconv.FormatInt(now.Unix(), 10),
					Type:          "receipt",
					Total:         pt.GrossAmount,
					PaidAmount:    pt.GrossAmount,
					Status:        "paid",
					IssueDate:     &now,
					DueDate:       &now,
				}
				model.DB.Create(&inv)
			}

			// Create Notification for admin
			notif := model.Notification{
				TenantID: tenant,
				Type:     "payment_settled",
				Title:    "Pembayaran Diterima: " + pt.InvoiceRef,
				Message:  "Pembayaran " + pt.Provider + " sebesar Rp " + strconv.Itoa(int(pt.GrossAmount)) + " dari " + pt.ClientName + " (" + pt.ClientEmail + ") telah diterima. Buat project sekarang?",
				RefTable: "payment_transactions",
				RefID:    pt.ID,
			}
			model.DB.Create(&notif)

			// Send email receipt to client (async, don't fail on error)
			go func() {
				cfg := email.DefaultConfig()
				if cfg.Host != "" {
					_ = email.SendPaymentReceipt(cfg, pt.ClientEmail, pt.ClientName, pt.InvoiceRef, strconv.Itoa(int(pt.GrossAmount)), pt.ProviderTxID)
				}
			}()

			// Mark webhook as processed for idempotency
			if webhookID != "" {
				markWebhookProcessed(webhookID, "ipaymu")
			}
		}
		model.DB.Model(&model.Order{}).Where("order_number = ?", p.ReferenceID).Update("status", "paid")
		notifySBDigital(p.ReferenceID, "SETTLED")
	}
	return c.JSON(fiber.Map{"status": "ok"})
}

// ForcePasswordReset resets a user's password to the onboarding default.
func ForcePasswordReset(c fiber.Ctx) error {
	var in struct {
		Email string `json:"email"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "email required"})
	}

	var u model.User
	if err := model.DB.Where("email = ?", in.Email).First(&u).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	hash, err := auth.HashPassword("changeme123")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	u.Password = hash
	u.MustChangePassword = true
	if err := model.DB.Save(&u).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"status": "ok"})
}

// forwardPayoutToPartners — teruskan event payout Xendit (v3) mentah ke
// logikraf-partners utk update status + notif WA. Env:
// PARTNERS_INTERNAL_URL (default http://127.0.0.1:8096), PARTNERS_INTERNAL_KEY.
func forwardPayoutToPartners(c fiber.Ctx) error {
	base := strings.TrimRight(os.Getenv("PARTNERS_INTERNAL_URL"), "/")
	if base == "" {
		base = "http://127.0.0.1:8096"
	}
	key := os.Getenv("PARTNERS_INTERNAL_KEY")
	body := c.Body()
	var ev struct {
		ReferenceID string `json:"reference_id"`
	}
	_ = json.Unmarshal(body, &ev)
	if ev.ReferenceID == "" {
		// tidak bisa dipetakan — balas ok supaya Xendit tidak retry
		return c.JSON(fiber.Map{"status": "ok", "message": "unmapped payout event"})
	}
	req, err := http.NewRequest(http.MethodPost, base+"/api/v1/internal/payout/status", bytes.NewReader(body))
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "internal"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Key", key)
	resp, err := (&http.Client{Timeout: 10 * time.Second}).Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "partners unreachable"})
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	// payout tak dikenal di partners (mis. row sudah dihapus) → abaikan supaya Xendit tidak retry
	if resp.StatusCode == 404 {
		return c.JSON(fiber.Map{"status": "ok", "message": "payout event ignored (tidak ditemukan di portal)"})
	}
	return c.Status(resp.StatusCode).JSON(fiber.Map{"status": "forwarded", "detail": string(raw)})
}
