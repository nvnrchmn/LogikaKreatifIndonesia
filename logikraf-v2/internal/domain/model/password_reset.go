package model

import "time"

// PasswordReset — token reset kata sandi portal. Nilai token TIDAK disimpan
// mentah, hanya hash SHA-256-nya, dan sekali pakai.
type PasswordReset struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Email     string     `gorm:"size:150;index" json:"email"`
	TokenHash string     `gorm:"size:64;index" json:"-"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time  `json:"created_at"`
}
