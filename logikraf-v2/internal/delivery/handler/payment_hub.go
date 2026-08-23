package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/ipaymu"

	"github.com/gofiber/fiber/v3"
)

var ipaymuClient = ipaymu.NewClient()

// CreateSubAccountRequest — payload untuk mendaftar sub-merchant baru.
type CreateSubAccountRequest struct {
	BusinessName string `json:"business_name" validate:"required"`
	ContactEmail string `json:"contact_email" validate:"required,email"`
	ContactPhone string `json:"contact_phone"`
	Address      string `json:"address"`
	OwnerName    string `json:"owner_name"`
	OwnerID      string `json:"owner_id_number"`
}

// CreateDirectPaymentRequest — payload untuk pembayaran langsung ke VA Logikraf.
type CreateDirectPaymentRequest struct {
	OrderID     string `json:"order_id" validate:"required"`
	Amount      uint   `json:"amount" validate:"required,min=1"`
	Description string `json:"description"`
	BuyerName   string `json:"buyer_name"`
	BuyerEmail  string `json:"buyer_email"`
	BuyerPhone  string `json:"buyer_phone"`
}

// CreateSplitPaymentRequest — payload untuk split payment (iuran warga).
type CreateSplitPaymentRequest struct {
	OrderID     string           `json:"order_id" validate:"required"`
	Amount      uint             `json:"amount" validate:"required,min=1"`
	Description string           `json:"description"`
	BuyerName   string           `json:"buyer_name"`
	BuyerEmail  string           `json:"buyer_email"`
	BuyerPhone  string           `json:"buyer_phone"`
	Splits      []SplitDetail    `json:"splits" validate:"required,min=1"`
}

// SplitDetail — satu bagian dari split.
type SplitDetail struct {
	MerchantID  string `json:"merchant_id"`
	Amount      uint   `json:"amount"`
	Description string `json:"description"`
}

// PaymentResponse — respons umum untuk pembayaran.
type PaymentResponse struct {
	TransactionID uint   `json:"transaction_id"`
	SessionID     string `json:"session_id"`
	PaymentURL    string `json:"payment_url"`
	Amount        uint   `json:"amount"`
	Status        string `json:"status"`
	VANumber      string `json:"va_number"`
}

// RegisterPaymentHubRoutes mount semua route Payment Hub.
func RegisterPaymentHubRoutes(app fiber.Router, admin fiber.Router, public fiber.Router) {
	// Middleware autentikasi API Key untuk tenant.
	auth := func(c fiber.Ctx) error {
		key := c.Get("X-Logikraf-API-Key")
		if key == "" {
			return c.Status(401).JSON(fiber.Map{"error": "missing X-Logikraf-API-Key"})
		}
		var apiKey model.APIKey
		if err := model.DB.Where("key = ? AND is_active = ?", key, true).First(&apiKey).Error; err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "invalid API key"})
		}
		if apiKey.TenantID == nil {
			return c.Status(401).JSON(fiber.Map{"error": "API key has no tenant"})
		}
		c.Locals("tenant_id", *apiKey.TenantID)
		return c.Next()
	}

	// === Tenant API (butuh API Key) ===
	hub := app.Group("/payment-hub/v1")
	hub.Use(auth)

	hub.Post("/sub-accounts", handleCreateSubAccount)
	hub.Get("/sub-accounts/me", handleGetMySubAccount)
	hub.Post("/payments", handleCreateDirectPayment)
	hub.Post("/split-payments", handleCreateSplitPayment)
	hub.Get("/payments/:id", handleGetPaymentStatus)
	hub.Get("/payments", handleListPayments)

	// Admin API (kelola API keys & lihat semua pembayaran)
	admin.Get("/payment-hub/transactions", handleAdminListAllTransactions)
	admin.Post("/payment-hub/api-keys", handleAdminCreateAPIKey)
	admin.Get("/payment-hub/api-keys", handleAdminListAPIKeys)

	// Public webhook (tanpa auth)
	public.Post("/payment-hub/webhook/ipaymu", handleIpaymuWebhook)
}

func handleCreateSubAccount(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(string)

	var req CreateSubAccountRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	// Cek apakah sudah ada.
	var existing model.TenantPaymentAccount
	if err := model.DB.Where("tenant_id = ? AND provider = ?", tenantID, "ipaymu").First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "sub-account sudah ada"})
	}

	// Buat sub-merchant di iPaymu.
	subBody := map[string]interface{}{
		"name":          req.BusinessName,
		"email":         req.ContactEmail,
		"phone":         req.ContactPhone,
		"address":       req.Address,
		"ownerName":     req.OwnerName,
		"ownerIdNumber": req.OwnerID,
	}
	bodyBytes, _ := json.Marshal(subBody)
	respBody, status, err := ipaymuClient.Do("POST", "/api/v2/submerchant", bodyBytes)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "gagal menghubungi iPaymu"})
	}

	var apiResp ipaymu.APIResponse
	if json.Unmarshal(respBody, &apiResp); err != nil || !apiResp.Status {
		return c.Status(502).JSON(fiber.Map{"error": fmt.Sprintf("iPaymu error (HTTP %d)", status)})
	}

	var subData struct {
		ID string `json:"SubMerchantId"`
		VA string `json:"VaNumber"`
	}
	json.Unmarshal(apiResp.Data, &subData)

	account := model.TenantPaymentAccount{
		TenantID:          tenantID,
		Provider:          "ipaymu",
		MerchantID:        subData.ID,
		MerchantReference: subData.VA,
		Status:            "ACTIVE",
		SettlementStatus:  "ENABLED",
	}
	if err := model.DB.Create(&account).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan sub-account"})
	}

	return c.Status(201).JSON(fiber.Map{
		"id":      account.ID,
		"tenant_id": account.TenantID,
		"va_number": subData.VA,
		"status":  account.Status,
	})
}

func handleGetMySubAccount(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(string)
	var account model.TenantPaymentAccount
	if err := model.DB.Where("tenant_id = ? AND provider = ?", tenantID, "ipaymu").First(&account).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "sub-account tidak ditemukan"})
	}
	return c.JSON(account)
}

func handleCreateDirectPayment(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(string)

	var req CreateDirectPaymentRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	var account model.TenantPaymentAccount
	if err := model.DB.Where("tenant_id = ? AND provider = ?", tenantID, "ipaymu").First(&account).Error; err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "tenant belum punya sub-account"})
	}

	paymentBody := map[string]interface{}{
		"amount":      req.Amount,
		"description": req.Description,
		"orderId":     req.OrderID,
		"buyerName":   req.BuyerName,
		"buyerEmail":  req.BuyerEmail,
		"buyerPhone":  req.BuyerPhone,
	}
	bodyBytes, _ := json.Marshal(paymentBody)
	respBody, status, err := ipaymuClient.Do("POST", "/api/v2/payment", bodyBytes)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "gagal menghubungi iPaymu"})
	}

	var apiResp ipaymu.APIResponse
	if json.Unmarshal(respBody, &apiResp); err != nil || !apiResp.Status {
		return c.Status(502).JSON(fiber.Map{"error": fmt.Sprintf("iPaymu error (HTTP %d)", status)})
	}

	var paymentData struct {
		SessionID  string `json:"sessionId"`
		VANumber   string `json:"vaNumber"`
		PaymentURL string `json:"url"`
	}
	json.Unmarshal(apiResp.Data, &paymentData)

	tx := model.PaymentTransaction{
		TenantID:         tenantID,
		PaymentAccountID: account.ID,
		InvoiceRef:       req.Description,
		Provider:         "ipaymu",
		OrderID:          req.OrderID,
		GrossAmount:      req.Amount,
		Status:           "pending",
	}
	model.DB.Create(&tx)

	return c.Status(201).JSON(PaymentResponse{
		TransactionID: tx.ID,
		SessionID:     paymentData.SessionID,
		PaymentURL:    paymentData.PaymentURL,
		Amount:        req.Amount,
		Status:        "pending",
		VANumber:      paymentData.VANumber,
	})
}

func handleCreateSplitPayment(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(string)

	var req CreateSplitPaymentRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	var account model.TenantPaymentAccount
	if err := model.DB.Where("tenant_id = ? AND provider = ?", tenantID, "ipaymu").First(&account).Error; err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "tenant belum punya sub-account"})
	}

	splits := make([]map[string]interface{}, 0, len(req.Splits))
	for _, sp := range req.Splits {
		splits = append(splits, map[string]interface{}{
			"merchantId":  sp.MerchantID,
			"amount":      sp.Amount,
			"description": sp.Description,
		})
	}

	paymentBody := map[string]interface{}{
		"amount":      req.Amount,
		"description": req.Description,
		"orderId":     req.OrderID,
		"buyerName":   req.BuyerName,
		"buyerEmail":  req.BuyerEmail,
		"buyerPhone":  req.BuyerPhone,
		"split":       splits,
	}
	bodyBytes, _ := json.Marshal(paymentBody)
	respBody, status, err := ipaymuClient.Do("POST", "/api/v2/payment", bodyBytes)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "gagal menghubungi iPaymu"})
	}

	var apiResp ipaymu.APIResponse
	if json.Unmarshal(respBody, &apiResp); err != nil || !apiResp.Status {
		return c.Status(502).JSON(fiber.Map{"error": fmt.Sprintf("iPaymu error (HTTP %d)", status)})
	}

	var paymentData struct {
		SessionID  string `json:"sessionId"`
		VANumber   string `json:"vaNumber"`
		PaymentURL string `json:"url"`
	}
	json.Unmarshal(apiResp.Data, &paymentData)

	tx := model.PaymentTransaction{
		TenantID:         tenantID,
		PaymentAccountID: account.ID,
		InvoiceRef:       req.Description,
		Provider:         "ipaymu",
		OrderID:          req.OrderID,
		GrossAmount:      req.Amount,
		Status:           "pending",
	}
	model.DB.Create(&tx)

	return c.Status(201).JSON(PaymentResponse{
		TransactionID: tx.ID,
		SessionID:     paymentData.SessionID,
		PaymentURL:    paymentData.PaymentURL,
		Amount:        req.Amount,
		Status:        "pending",
		VANumber:      paymentData.VANumber,
	})
}

func handleGetPaymentStatus(c fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	var tx model.PaymentTransaction
	if err := model.DB.First(&tx, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "transaction not found"})
	}
	return c.JSON(tx)
}

func handleListPayments(c fiber.Ctx) error {
	tenantID := c.Locals("tenant_id").(string)
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	var txs []model.PaymentTransaction
	model.DB.Where("tenant_id = ?", tenantID).Order("created_at desc").Limit(limit).Find(&txs)
	return c.JSON(txs)
}

func handleAdminListAllTransactions(c fiber.Ctx) error {
	var txs []model.PaymentTransaction
	model.DB.Order("created_at desc").Limit(200).Find(&txs)
	return c.JSON(txs)
}

func handleAdminCreateAPIKey(c fiber.Ctx) error {
	var req struct {
		TenantID    *string `json:"tenant_id"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
	}
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	key := generateAPIKey()
	apiKey := model.APIKey{
		Key:         key,
		Name:        req.Name,
		Description: req.Description,
		TenantID:    req.TenantID,
		IsActive:    true,
	}
	if err := model.DB.Create(&apiKey).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create API key"})
	}
	return c.Status(201).JSON(apiKey)
}

func handleAdminListAPIKeys(c fiber.Ctx) error {
	var keys []model.APIKey
	model.DB.Order("created_at desc").Find(&keys)
	return c.JSON(keys)
}

func handleIpaymuWebhook(c fiber.Ctx) error {
	var payload struct {
		TrxID       string `json:"trx_id"`
		Status      string `json:"status"`
		ReferenceID string `json:"reference_id"`
		Amount      uint   `json:"amount"`
		VA          string `json:"va_number"`
	}
	if err := c.Bind().Body(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	var tx model.PaymentTransaction
	if err := model.DB.Where("order_id = ?", payload.ReferenceID).First(&tx).Error; err != nil {
		log.Printf("[Webhook] transaction not found: %s", payload.ReferenceID)
		return c.Status(200).JSON(fiber.Map{"status": "ok"})
	}

	switch strings.ToLower(payload.Status) {
	case "berhasil", "success", "paid", "settled":
		now := time.Now()
		tx.Status = "settled"
		tx.ProviderTxID = payload.TrxID
		tx.SettledAt = &now
	case "gagal", "failed", "expired":
		tx.Status = "failed"
	default:
		tx.Status = strings.ToLower(payload.Status)
	}
	model.DB.Save(&tx)

	model.DB.Create(&model.Notification{
		TenantID: tx.TenantID,
		Type:     "payment_webhook_received",
		Title:    "Pembayaran " + tx.Status,
		Message:  fmt.Sprintf("Order %s: Rp %d — status %s", payload.ReferenceID, payload.Amount, tx.Status),
		RefTable: "payment_transactions",
		RefID:    tx.ID,
		IsRead:   true,
	})

	return c.JSON(fiber.Map{"status": "received"})
}

func generateAPIKey() string {
	b := make([]byte, 24)
	rand.Read(b)
	return "lk_" + hex.EncodeToString(b)
}
