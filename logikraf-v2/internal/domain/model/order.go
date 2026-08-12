package model

import "time"

type Order struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `json:"user_id"`
	ServiceID      *uint     `json:"service_id"`
	OrderNumber    string    `gorm:"size:50;uniqueIndex" json:"order_number"`
	ProjectName    string    `gorm:"size:255;not null" json:"project_name"`
	TotalAmount    uint      `json:"total_amount"`
	Status         string    `gorm:"size:50;default:pending" json:"status"`
	MilestoneStatus string   `gorm:"size:100" json:"milestone_status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	DeletedAt      *time.Time `gorm:"index" json:"-"`
}
