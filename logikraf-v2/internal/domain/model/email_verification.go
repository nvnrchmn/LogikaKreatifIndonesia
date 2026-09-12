package model

import "time"

// EmailVerification — token verifikasi email portal klien. Mengikuti pola
// PasswordReset: hanya hash SHA-256 token yang disimpan, sekali pakai,
// berlaku 24 jam.
type EmailVerification struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Email     string     `gorm:"size:150;index" json:"email"`
	TokenHash string     `gorm:"size:64;index" json:"-"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time  `json:"created_at"`
}
