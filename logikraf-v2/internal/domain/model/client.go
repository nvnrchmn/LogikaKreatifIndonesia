package model

import "time"

type Client struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	UserID      uint       `gorm:"index" json:"user_id"`
	InviteCode  *string    `gorm:"size:32;uniqueIndex" json:"-"`
	CompanyName string     `gorm:"size:255" json:"company_name"`
	PICName     string     `gorm:"size:255" json:"pic_name"`
	Email       string     `gorm:"size:255" json:"email"`
	Phone       string     `gorm:"size:255" json:"phone"`
	Address     string     `gorm:"type:text" json:"address"`
	City        string     `gorm:"size:255" json:"city"`
	Notes       string     `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
}
