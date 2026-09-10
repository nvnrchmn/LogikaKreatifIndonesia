package model

import "time"

// TenantPaymentAccount tracks a tenant's merchant account onboarding status.
// Replaces the concept of a tenant wallet: the tenant receives settlement
// directly from the provider into their own bank account.
type TenantPaymentAccount struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	TenantID          string    `gorm:"size:64;uniqueIndex:uniq_tenant_provider" json:"tenant_id"`
	Provider          string    `gorm:"size:50;uniqueIndex:uniq_tenant_provider" json:"provider"`
	MerchantID        string    `gorm:"size:255" json:"merchant_id"`
	MerchantReference string    `gorm:"size:255" json:"merchant_reference"`
	Status            string    `gorm:"size:50;default:PAYMENT_NOT_CONFIGURED" json:"status"` // PAYMENT_NOT_CONFIGURED|ONBOARDING|UNDER_REVIEW|ACTIVE|SUSPENDED
	SettlementStatus  string    `gorm:"size:50" json:"settlement_status"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// PaymentTransaction is the per-tenant ledger entry for a payment.
// Logikraf never holds tenant funds; this only records entitlement, fees, and reconciliation.
type PaymentTransaction struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	TenantID         string     `gorm:"size:64;index" json:"tenant_id"`
	PaymentAccountID uint       `json:"payment_account_id"`
	InvoiceRef       string     `gorm:"size:255;index" json:"invoice_ref"`
	Provider         string     `gorm:"size:50" json:"provider"`
	ProviderTxID     string     `gorm:"size:255;index" json:"provider_tx_id"`
	OrderID          string     `gorm:"size:255" json:"order_id"`
	ClientName       string     `gorm:"size:255" json:"client_name"`
	ClientEmail      string     `gorm:"size:255" json:"client_email"`
	ClientPhone      string     `gorm:"size:50" json:"client_phone"`
	GrossAmount      uint       `json:"gross_amount"`
	ProviderFee      uint       `json:"provider_fee"`
	PlatformFee      uint       `json:"platform_fee"`
	NetAmount        uint       `json:"net_amount"`
	Status           string     `gorm:"size:50;default:pending" json:"status"` // pending|paid|settled|failed
	PaidAt           *time.Time `json:"paid_at"`
	SettledAt        *time.Time `json:"settled_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}
