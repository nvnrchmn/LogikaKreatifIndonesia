package model

import "time"

type Lead struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Name           string    `gorm:"size:255;not null" json:"name"`
	Email          string    `gorm:"size:255;not null" json:"email"`
	Company        string    `gorm:"size:255" json:"company"`
	ServiceCategory string   `gorm:"size:100" json:"service_category"`
	Notes          string    `gorm:"type:text" json:"notes"`
	Status         string    `gorm:"size:50;default:new" json:"status"`
	LeadScore      int       `gorm:"default:0" json:"lead_score"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	DeletedAt      *time.Time `gorm:"index" json:"-"`
}
