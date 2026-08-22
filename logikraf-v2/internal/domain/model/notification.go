package model

import "time"

// Notification represents an admin notification for events like payment settlement.
type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TenantID  string    `gorm:"size:64;default:logikraf" json:"tenant_id"`
	Type      string    `gorm:"size:50;not null" json:"type"` // payment_settled, project_due, etc.
	Title     string    `gorm:"size:255;not null" json:"title"`
	Message   string    `gorm:"type:text" json:"message"`
	RefTable  string    `gorm:"size:64" json:"ref_table"`
	RefID     uint      `json:"ref_id"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
