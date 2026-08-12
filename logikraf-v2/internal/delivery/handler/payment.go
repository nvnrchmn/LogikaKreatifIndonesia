package handler

import (
	"bytes"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
)

func setting(key, tenant string) string {
	var s model.Setting
	if err := model.DB.Where("tenant = ? AND `key` = ?", tenant, key).First(&s).Error; err != nil {
		return ""
	}
	return s.Value
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
	Amount      uint   `json:"amount"`
	PayerEmail  string `json:"payer_email"`
	Description string `json:"description"`
}

// CreateXenditInvoice proxies an invoice creation to Xendit.
func CreateXenditInvoice(c fiber.Ctx) error {
	secret := setting("xendit_secret_key", tenantOf(c))
	if secret == "" {
		return c.Status(400).JSON(fiber.Map{"error": "xendit_secret_key not configured"})
	}

	var in xenditInvoiceRequest
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if in.ExternalID == "" || in.Amount == 0 || in.PayerEmail == "" {
		return c.Status(400).JSON(fiber.Map{"error": "external_id, amount, payer_email required"})
	}

	body, _ := json.Marshal(in)
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
		tenant := tenantOf(c)
		var acc model.TenantPaymentAccount
		model.DB.Where("tenant_id = ? AND provider = ?", tenant, "xendit").FirstOrCreate(&acc, model.TenantPaymentAccount{TenantID: tenant, Provider: "xendit"})
		acc.Status = "ACTIVE"
		model.DB.Save(&acc)
		gross := in.Amount
		providerFee := calcFee(gross, setting("xendit_fee_percent", tenant), setting("xendit_fee_flat", tenant))
		platformFee := calcFee(gross, setting("platform_fee_percent", tenant), "")
		outMap, _ := out.(map[string]any)
		orderID := in.ExternalID
		if id, ok := outMap["id"].(string); ok {
			orderID = id
		}
		model.DB.Create(&model.PaymentTransaction{
			TenantID:         tenant,
			PaymentAccountID: acc.ID,
			InvoiceRef:       in.Description,
			Provider:         "xendit",
			OrderID:          orderID,
			ProviderTxID:     orderID,
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
		OrderID      string `json:"order_id"`
		Amount       uint   `json:"amount"`
		FirstName    string `json:"first_name"`
		Email        string `json:"email"`
		Phone        string `json:"phone"`
		Description  string `json:"description"`
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
		model.DB.Save(&acc)
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
			GrossAmount:      gross,
			ProviderFee:      providerFee,
			PlatformFee:      platformFee,
			NetAmount:        gross - providerFee - platformFee,
			Status:           "pending",
		}
		if tok, ok := out["token"].(string); ok {
			pt.ProviderTxID = tok
		}
		model.DB.Create(&pt)
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
		model.DB.Create(&tx)
		return
	}
	model.DB.Save(&tx)
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

	ref := p.ExternalID
	if ref == "" {
		ref = p.ID
	}
	if ref == "" {
		return c.Status(400).JSON(fiber.Map{"error": "missing reference"})
	}

	if p.Status == "PAID" {
		upsertTransaction(ref, "xendit", "settled", p.Amount)
		var pt model.PaymentTransaction
		if err := model.DB.Where("order_id = ? AND tenant_id = ?", ref, tenant).First(&pt).Error; err == nil {
			pt.Status = "settled"
			now := time.Now()
			pt.SettledAt = &now
			model.DB.Save(&pt)
		}
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
		model.DB.Save(&pt)
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
