package model

import "time"

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"size:255;not null" json:"name"`
	Email    string `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password string `gorm:"size:255;not null" json:"-"`
	Role     string `gorm:"size:50;not null;default:client;enum:admin,client" json:"role"`
	// Status membedakan akun undangan yang belum diaktifkan dari akun normal, dan
	// memungkinkan pencabutan akses tanpa menghapus barisnya (jejak audit tetap ada).
	Status string `gorm:"size:20;not null;default:active" json:"status"`
	// Scope membatasi modul yang boleh dibuka staf: "full" (pemilik) atau "ops"
	// (operasional, tanpa modul uang & sistem). Kosong diperlakukan sebagai "full"
	// supaya akun lama tidak ikut terkunci.
	Scope              string     `gorm:"size:20;not null;default:full" json:"scope"`
	InviteToken        *string    `gorm:"size:64;uniqueIndex" json:"-"`
	InviteExpires      *time.Time `json:"invite_expires_at"`
	InvitedBy          *uint      `json:"invited_by"`
	Tenant             string     `gorm:"size:64;not null;default:logikraf" json:"tenant"`
	MustChangePassword bool       `gorm:"default:false" json:"must_change_password"`
	EmailVerifiedAt    *time.Time `json:"email_verified_at"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	DeletedAt          *time.Time `gorm:"index" json:"-"`
}
