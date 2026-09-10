package model

import "time"

type User struct {
	ID                 uint       `gorm:"primaryKey" json:"id"`
	Name               string     `gorm:"size:255;not null" json:"name"`
	Email              string     `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password           string     `gorm:"size:255;not null" json:"-"`
	Role               string     `gorm:"size:50;not null;default:client;enum:admin,client" json:"role"`
	Tenant             string     `gorm:"size:64;not null;default:logikraf" json:"tenant"`
	MustChangePassword bool       `gorm:"default:false" json:"must_change_password"`
	EmailVerifiedAt    *time.Time `json:"email_verified_at"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	DeletedAt          *time.Time `gorm:"index" json:"-"`
}
