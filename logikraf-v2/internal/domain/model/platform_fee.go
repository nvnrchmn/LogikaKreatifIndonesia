package model

import "time"

// PlatformFee — catatan biaya layanan Logikraf per transaksi store (accrual).
// Dibuat otomatis saat webhook PAID milik store diterima hub, lalu dipakai untuk
// laporan bulanan & pemotongan (mode Managed) atau penagihan (mode LIVE).
type PlatformFee struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	StoreID    uint      `json:"store_id" gorm:"index;not null"`
	Period     string    `json:"period" gorm:"size:7;index"`            // format YYYY-MM
	ExternalID string    `json:"external_id" gorm:"size:120;index"`     // nomor pesanan store
	InvoiceID  string    `json:"invoice_id" gorm:"size:120"`            // id invoice/payment_request Xendit
	Gross      int       `json:"gross"`                                 // nilai yang dibayar customer
	Basis      string    `json:"basis" gorm:"size:20;default:total"`    // total | product
	FeePct     float64   `json:"fee_pct" gorm:"type:decimal(5,2)"`      // tarif saat transaksi
	FeeAmount  int       `json:"fee_amount"`                            // round(gross * pct / 100)
	Status     string    `json:"status" gorm:"size:20;default:accrued"` // accrued|reversed|invoiced|collected
	Note       string    `json:"note" gorm:"size:255"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (PlatformFee) TableName() string { return "platform_fees" }
