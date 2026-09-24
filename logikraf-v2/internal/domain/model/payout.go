package model

import "time"

// Payout — pencairan dana dari sub-akun tenant ke rekening bank pemiliknya,
// dieksekusi via Xendit Payouts v3 atas nama sub-akun (header for-user-id).
// Disimpan agar idempotensi (idempotency-key stabil) dan pencocokan webhook
// payout.* dapat dilakukan tanpa memanggil Xendit ulang.
type Payout struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StoreID       uint      `gorm:"index" json:"store_id"`
	SubAccountID  string    `gorm:"size:120;index" json:"sub_account_id"`
	TenantRef     string    `gorm:"size:80;index" json:"tenant_ref"`
	ExternalID    string    `gorm:"size:120;index" json:"external_id"` // reference_id yang kita kirim
	ProviderID    string    `gorm:"size:120;index" json:"provider_id"` // id payout dari Xendit
	Amount        int       `json:"amount"`
	Currency      string    `gorm:"size:8;default:IDR" json:"currency"`
	Status        string    `gorm:"size:30;default:PENDING" json:"status"`
	FailureCode   string    `gorm:"size:80" json:"failure_code"`
	FailureReason string    `gorm:"size:255" json:"failure_reason"`
	RecipientJSON string    `gorm:"type:text" json:"-"` // data rekening tujuan (tidak diekspos di list)
	RawProvider   string    `gorm:"type:text" json:"-"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Payout) TableName() string { return "payouts" }
