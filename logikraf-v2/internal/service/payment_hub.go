package paymenthub

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/ipaymu"
	"gorm.io/gorm"
)

// Service implements the Payment Hub: a centralized payment gateway that
// products (smarthub, etc.) call instead of talking to iPaymu directly.
//
// Each tenant (SaaS customer) gets a sub-account. For split-payment use cases
// (e.g. iuran warga), the tenant also gets a sub-merchant VA so funds can be
// split automatically by iPaymu.
type Service struct {
	db     *gorm.DB
	ipaymu *ipaymu.Client
}

// NewService builds a Payment Hub Service.
func NewService(db *gorm.DB) *Service {
	return &Service{
		db:     db,
		ipaymu: ipaymu.NewClient(),
	}
}

// NewServiceWithClient builds a Service with a custom iPaymu client (useful for tests).
func NewServiceWithClient(db *gorm.DB, c *ipaymu.Client) *Service {
	return &Service{db: db, ipaymu: c}
}

// SubAccountRequest is the payload to register a new tenant sub-account.
type SubAccountRequest struct {
	TenantID     string `json:"tenant_id" validate:"required"`
	BusinessName string `json:"business_name" validate:"required"`
	ContactEmail string `json:"contact_email" validate:"required,email"`
	ContactPhone string `json:"contact_phone"`
	Address      string `json:"address"`
	OwnerName    string `json:"owner_name"`
	OwnerID      string `json:"owner_id_number"` // KTP
}

// SubAccountResponse is returned after creating a sub-account.
type SubAccountResponse struct {
	ID           string `json:"id"`
	TenantID     string `json:"tenant_id"`
	BusinessName string `json:"business_name"`
	Status       string `json:"status"`
	CreatedAt    string `json:"created_at"`
}

// CreateSubAccount registers a tenant in the Payment Hub. It stores the
// sub-account locally and creates a sub-merchant on iPaymu so the tenant can
// receive split payments.
func (s *Service) CreateSubAccount(req SubAccountRequest) (*SubAccountResponse, error) {
	// Check for existing account.
	var existing model.TenantPaymentAccount
	if err := s.db.Where("tenant_id = ? AND provider = ?", req.TenantID, "ipaymu").First(&existing).Error; err == nil {
		return nil, fmt.Errorf("sub-account already exists for tenant %s", req.TenantID)
	}

	// Build iPaymu submerchant payload.
	// Reference: POST /api/v2/submerchant
	subBody := map[string]interface{}{
		"name":          req.BusinessName,
		"email":         req.ContactEmail,
		"phone":         req.ContactPhone,
		"address":       req.Address,
		"ownerName":     req.OwnerName,
		"ownerIdNumber": req.OwnerID,
		"ipnUrl":        "", // optional per-tenant IPN
	}
	bodyBytes, _ := json.Marshal(subBody)

	respBody, status, err := s.ipaymu.Do("POST", "/api/v2/submerchant", bodyBytes)
	if err != nil {
		return nil, fmt.Errorf("ipaymu submerchant request failed: %w", err)
	}

	var apiResp ipaymu.APIResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse iPaymu response: %w", err)
	}
	if status < 200 || status >= 300 || !apiResp.Status {
		return nil, fmt.Errorf("ipaymu submerchant creation failed (HTTP %d): %s", status, apiResp.Error)
	}

	// Parse submerchant data.
	var subData struct {
		ID string `json:"SubMerchantId"`
		VA string `json:"VaNumber"`
	}
	if err := json.Unmarshal(apiResp.Data, &subData); err != nil {
		// Some iPaymu responses wrap differently; tolerate.
		subData.ID = string(apiResp.Data)
	}

	// Persist locally.
	account := model.TenantPaymentAccount{
		TenantID:          req.TenantID,
		Provider:          "ipaymu",
		MerchantID:        subData.ID,
		MerchantReference: subData.VA,
		Status:            "ACTIVE",
		SettlementStatus:  "ENABLED",
	}
	if err := s.db.Create(&account).Error; err != nil {
		return nil, fmt.Errorf("failed to save sub-account: %w", err)
	}

	return &SubAccountResponse{
		ID:           fmt.Sprintf("%d", account.ID),
		TenantID:     account.TenantID,
		BusinessName: req.BusinessName,
		Status:       account.Status,
		CreatedAt:    account.CreatedAt.Format(time.RFC3339),
	}, nil
}

// GetSubAccount returns the sub-account for a tenant.
func (s *Service) GetSubAccount(tenantID string) (*model.TenantPaymentAccount, error) {
	var account model.TenantPaymentAccount
	if err := s.db.Where("tenant_id = ? AND provider = ?", tenantID, "ipaymu").First(&account).Error; err != nil {
		return nil, fmt.Errorf("sub-account not found for tenant %s", tenantID)
	}
	return &account, nil
}

// PaymentRequest is the payload to create a direct payment (non-split).
type PaymentRequest struct {
	TenantID    string `json:"tenant_id" validate:"required"`
	OrderID     string `json:"order_id" validate:"required"`
	Amount      uint   `json:"amount" validate:"required,min=1"`
	Description string `json:"description"`
	BuyerName   string `json:"buyer_name"`
	BuyerEmail  string `json:"buyer_email"`
	BuyerPhone  string `json:"buyer_phone"`
}

// PaymentResponse is returned after creating a payment.
type PaymentResponse struct {
	TransactionID uint   `json:"transaction_id"`
	SessionID     string `json:"session_id"`
	PaymentURL    string `json:"payment_url"`
	Amount        uint   `json:"amount"`
	Status        string `json:"status"`
	VANumber      string `json:"va_number"`
}

// CreateDirectPayment creates a payment that goes to the master VA (Logikraf).
// Used for subscription payments where Logikraf is the ultimate payee.
func (s *Service) CreateDirectPayment(req PaymentRequest) (*PaymentResponse, error) {
	// Verify tenant has a sub-account.
	var account model.TenantPaymentAccount
	if err := s.db.Where("tenant_id = ? AND provider = ?", req.TenantID, "ipaymu").First(&account).Error; err != nil {
		return nil, fmt.Errorf("tenant %s has no sub-account", req.TenantID)
	}

	// Build iPaymu payment body.
	// Reference: POST /api/v2/payment
	paymentBody := map[string]interface{}{
		"amount":      req.Amount,
		"description": req.Description,
		"orderId":     req.OrderID,
		"buyerName":   req.BuyerName,
		"buyerEmail":  req.BuyerEmail,
		"buyerPhone":  req.BuyerPhone,
		"returnUrl":   "", // optional
		"cancelUrl":   "", // optional
		"notifyUrl":   "", // hub webhook
	}
	bodyBytes, _ := json.Marshal(paymentBody)

	respBody, status, err := s.ipaymu.Do("POST", "/api/v2/payment", bodyBytes)
	if err != nil {
		return nil, fmt.Errorf("ipaymu payment request failed: %w", err)
	}

	var apiResp ipaymu.APIResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse iPaymu response: %w", err)
	}
	if status < 200 || status >= 300 || !apiResp.Status {
		return nil, fmt.Errorf("ipaymu payment creation failed (HTTP %d): %s", status, apiResp.Error)
	}

	var paymentData struct {
		SessionID  string `json:"sessionId"`
		VANumber   string `json:"vaNumber"`
		PaymentURL string `json:"url"`
	}
	if err := json.Unmarshal(apiResp.Data, &paymentData); err != nil {
		return nil, fmt.Errorf("failed to parse payment data: %w", err)
	}

	// Record the transaction locally.
	tx := model.PaymentTransaction{
		TenantID:         req.TenantID,
		PaymentAccountID: account.ID,
		InvoiceRef:       req.Description,
		Provider:         "ipaymu",
		OrderID:          req.OrderID,
		GrossAmount:      req.Amount,
		Status:           "pending",
	}
	if err := s.db.Create(&tx).Error; err != nil {
		return nil, fmt.Errorf("failed to record transaction: %w", err)
	}

	return &PaymentResponse{
		TransactionID: tx.ID,
		SessionID:     paymentData.SessionID,
		PaymentURL:    paymentData.PaymentURL,
		Amount:        req.Amount,
		Status:        "pending",
		VANumber:      paymentData.VANumber,
	}, nil
}

// SplitPaymentRequest is the payload for a split payment (iuran warga).
type SplitPaymentRequest struct {
	TenantID    string        `json:"tenant_id" validate:"required"`
	OrderID     string        `json:"order_id" validate:"required"`
	Amount      uint          `json:"amount" validate:"required,min=1"`
	Description string        `json:"description"`
	BuyerName   string        `json:"buyer_name"`
	BuyerEmail  string        `json:"buyer_email"`
	BuyerPhone  string        `json:"buyer_phone"`
	Splits      []SplitDetail `json:"splits" validate:"required,min=1"`
}

// SplitDetail defines one leg of a split.
type SplitDetail struct {
	MerchantID  string `json:"merchant_id"` // sub-merchant VA
	Amount      uint   `json:"amount"`
	Description string `json:"description"`
}

// CreateSplitPayment creates a payment that iPaymu automatically splits
// between the master VA and one or more sub-merchant VAs.
func (s *Service) CreateSplitPayment(req SplitPaymentRequest) (*PaymentResponse, error) {
	var account model.TenantPaymentAccount
	if err := s.db.Where("tenant_id = ? AND provider = ?", req.TenantID, "ipaymu").First(&account).Error; err != nil {
		return nil, fmt.Errorf("tenant %s has no sub-account", req.TenantID)
	}

	// Build split array for iPaymu.
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

	respBody, status, err := s.ipaymu.Do("POST", "/api/v2/payment", bodyBytes)
	if err != nil {
		return nil, fmt.Errorf("ipaymu split payment request failed: %w", err)
	}

	var apiResp ipaymu.APIResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse iPaymu response: %w", err)
	}
	if status < 200 || status >= 300 || !apiResp.Status {
		return nil, fmt.Errorf("ipaymu split payment creation failed (HTTP %d): %s", status, apiResp.Error)
	}

	var paymentData struct {
		SessionID  string `json:"sessionId"`
		VANumber   string `json:"vaNumber"`
		PaymentURL string `json:"url"`
	}
	if err := json.Unmarshal(apiResp.Data, &paymentData); err != nil {
		return nil, fmt.Errorf("failed to parse payment data: %w", err)
	}

	tx := model.PaymentTransaction{
		TenantID:         req.TenantID,
		PaymentAccountID: account.ID,
		InvoiceRef:       req.Description,
		Provider:         "ipaymu",
		OrderID:          req.OrderID,
		GrossAmount:      req.Amount,
		Status:           "pending",
	}
	if err := s.db.Create(&tx).Error; err != nil {
		return nil, fmt.Errorf("failed to record transaction: %w", err)
	}

	return &PaymentResponse{
		TransactionID: tx.ID,
		SessionID:     paymentData.SessionID,
		PaymentURL:    paymentData.PaymentURL,
		Amount:        req.Amount,
		Status:        "pending",
		VANumber:      paymentData.VANumber,
	}, nil
}

// WebhookPayload is the notification body iPaymu sends on payment events.
type WebhookPayload struct {
	TrxID       string `json:"trx_id"`
	Status      string `json:"status"`
	ReferenceID string `json:"reference_id"`
	Amount      uint   `json:"amount"`
	VA          string `json:"va_number"`
	Provider    string `json:"provider"`
}

// ProcessWebhook handles an incoming iPaymu webhook. It updates the local
// transaction status and writes a notification.
func (s *Service) ProcessWebhook(payload WebhookPayload) error {
	var tx model.PaymentTransaction
	if err := s.db.Where("order_id = ?", payload.ReferenceID).First(&tx).Error; err != nil {
		return fmt.Errorf("transaction not found for order %s: %w", payload.ReferenceID, err)
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

	if err := s.db.Save(&tx).Error; err != nil {
		return fmt.Errorf("failed to update transaction: %w", err)
	}

	// Notify admin.
	s.db.Create(&model.Notification{
		TenantID: tx.TenantID,
		Type:     "payment_webhook_received",
		Title:    "Pembayaran " + tx.Status,
		Message:  fmt.Sprintf("Order %s: Rp %d — status %s", payload.ReferenceID, payload.Amount, tx.Status),
		RefTable: "payment_transactions",
		RefID:    tx.ID,
		IsRead:   true,
	})

	return nil
}

// GetPaymentStatus returns the current status of a payment.
func (s *Service) GetPaymentStatus(transactionID uint) (*model.PaymentTransaction, error) {
	var tx model.PaymentTransaction
	if err := s.db.First(&tx, transactionID).Error; err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}
	return &tx, nil
}

// ListPayments returns recent payments for a tenant.
func (s *Service) ListPayments(tenantID string, limit int) ([]model.PaymentTransaction, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	var txs []model.PaymentTransaction
	if err := s.db.Where("tenant_id = ?", tenantID).
		Order("created_at desc").Limit(limit).Find(&txs).Error; err != nil {
		return nil, err
	}
	return txs, nil
}
