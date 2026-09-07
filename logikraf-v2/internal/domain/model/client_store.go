package model

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// ClientStore adalah toko online client (contoh: MysticGlide) yang uang
// penjualannya masuk ke akun pembayaran Logikraf. Setiap store punya key
// internal (X-Internal-Key) utk menarik data finance & menandai settlement.
type ClientStore struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Slug        string    `gorm:"size:60;uniqueIndex;not null" json:"slug"`
	Name        string    `gorm:"size:120;not null" json:"name"`
	BaseURL     string    `gorm:"size:255" json:"base_url"`                   // API internal store, contoh: http://127.0.0.1:8095/api/v1/internal
	InternalKey string    `gorm:"size:100" json:"-"`                          // X-Internal-Key (tidak pernah diekspos di list JSON)
	FeePct      float64   `gorm:"type:decimal(5,2);default:0" json:"fee_pct"` // Logikraf Fee % (0 = otomatis dari Xendit, info/tampilan saja)
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (ClientStore) TableName() string { return "client_stores" }

// GenerateInternalKey returns a 48-hex-char server-generated secret.
func GenerateInternalKey() string {
	b := make([]byte, 24)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
