package model

import "time"

// QrisPayment — pembayaran QRIS kustom (halaman bayar sendiri, bukan hosted
// page Xendit). Dibuat via Xendit Payment Requests API (fallback QR Codes API),
// status di-update oleh webhook / simulator mode tes.
type QrisPayment struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	ReferenceID string     `json:"reference_id" gorm:"size:120;uniqueIndex"`
	StoreID     uint       `json:"store_id" gorm:"index;default:0"`   // 0 = LKI sendiri, >0 = client store (MG dll)
	ExternalID  string     `json:"external_id" gorm:"size:120;index"` // mis. nomor pesanan/invoice LKI
	ClientName  string     `json:"client_name" gorm:"size:150"`
	ClientEmail string     `json:"client_email" gorm:"size:150;index"`
	ClientPhone string     `json:"client_phone" gorm:"size:40"`
	PackageID   uint       `json:"package_id" gorm:"index"`
	PackageName string     `json:"package_name" gorm:"size:150"`
	ProviderID  string     `json:"provider_id" gorm:"size:120"` // id payment_request / qr_code Xendit
	QrString    string     `json:"qr_string" gorm:"type:text"`  // payload QRIS (di-render jadi QR di FE)
	Amount      int        `json:"amount"`
	Currency    string     `json:"currency" gorm:"size:8;default:IDR"`
	ChannelCode string     `json:"channel_code" gorm:"size:40;default:QRIS"`
	Status      string     `json:"status" gorm:"size:20;default:pending"` // pending|paid|expired|failed
	Mode        string     `json:"mode" gorm:"size:12;default:test"`      // test|live
	PayerName   string     `json:"payer_name" gorm:"size:120"`
	ExpiresAt   *time.Time `json:"expires_at"`
	PaidAt      *time.Time `json:"paid_at"`
	RawProvider string     `json:"-" gorm:"type:text"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
