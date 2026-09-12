package model

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// ClientStore adalah toko online client (contoh: MysticGlide) yang uang
// penjualannya masuk ke akun pembayaran Logikraf. Setiap store punya key
// internal (X-Internal-Key) utk menarik data finance & menandai settlement,
// plus konfigurasi routing webhook (ext_prefix) kalau store menumpang di akun
// Xendit Logikraf — Xendit callback masuk logikraf.id lalu diforward ke store.
type ClientStore struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Slug        string  `gorm:"size:60;uniqueIndex;not null" json:"slug"`
	Name        string  `gorm:"size:120;not null" json:"name"`
	BaseURL     string  `gorm:"size:255" json:"base_url"` // base API store, contoh: http://127.0.0.1:8095
	InternalKey string  `gorm:"size:100" json:"-"`        // X-Internal-Key (tidak pernah diekspos di list JSON)
	FeePct      float64 `gorm:"type:decimal(5,2);default:0" json:"fee_pct"`
	// Konfigurasi biaya layanan platform (dipakai mesin fee: accrual + laporan)
	FeeEnabled      bool       `gorm:"default:true" json:"fee_enabled"`
	FeeMonthlyFixed int        `gorm:"default:50000" json:"fee_monthly_fixed"`
	FeeMinMonthly   int        `gorm:"default:100000" json:"fee_min_monthly"`
	FeeBasis        string     `gorm:"size:20;default:total" json:"fee_basis"`
	FeeWaivedUntil  *time.Time `json:"fee_waived_until"`
	IsActive        bool       `gorm:"default:true" json:"is_active"`
	ExtPrefix       string     `gorm:"size:20" json:"ext_prefix"` // prefix external_id Xendit, contoh "mg-" → route webhook ke store ini
	WebhookURL      string     `gorm:"size:255" json:"-"`         // endpoint webhook store, kosong = BaseURL + "/api/v1/webhook/xendit"
	WebhookSecret   string     `gorm:"size:100" json:"-"`         // shared secret utk header X-Logikraf-Signature saat forward
	// XenPlatform (portal mitra partners.logikraf.id)
	SubAccountID string    `gorm:"size:120" json:"sub_account_id"` // Business ID Managed Sub-account Xendit
	EntityType   string    `gorm:"size:40" json:"entity_type"`     // INDIVIDUAL / SOLE_PROPRIETORSHIP / CORPORATION dll
	KYCStatus    string    `gorm:"size:40" json:"kyc_status"`      // REGISTERED → AWAITING_DOCS → PENDING_VERIFICATION → LIVE
	// Hasil tarikan LANGSUNG dari Xendit (tombol "Refresh Data Xendit"; read-only di UI admin)
	XenditAccountStatus string     `gorm:"size:40" json:"xendit_account_status"` // status AKUN Xendit, mis. AWAITING_DOCS
	XenditSyncedAt      *time.Time `json:"xendit_synced_at"`                     // waktu sinkron terakhir dari Xendit
	WAPhone             string     `gorm:"size:30" json:"wa_phone"`              // WA notifikasi mitra (fallback level store)
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (ClientStore) TableName() string { return "client_stores" }

// GenerateInternalKey returns a 48-hex-char server-generated secret.
func GenerateInternalKey() string {
	b := make([]byte, 24)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
