package model

import "time"

// PartnerUser = akun login portal mitra partners.logikraf.id (dipegang mitra).
// Tabel ini dipakai bersama server logikraf-partners (skema harus identik).
type PartnerUser struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	ClientStoreID  uint       `gorm:"index;not null" json:"client_store_id"`
	Email          string     `gorm:"uniqueIndex;size:190;not null" json:"email"`
	PasswordHash   string     `gorm:"size:255;not null" json:"-"`
	MustChangePass bool       `gorm:"default:true" json:"must_change_pass"`
	WAPhone        string     `gorm:"size:30" json:"wa_phone,omitempty"`
	Active         bool       `gorm:"default:true" json:"active"`
	LastLoginAt    *time.Time `json:"last_login_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func (PartnerUser) TableName() string { return "partner_users" }
