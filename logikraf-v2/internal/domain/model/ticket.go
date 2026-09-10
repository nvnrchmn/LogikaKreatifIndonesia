package model

import "time"

type Ticket struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	UserID      uint       `json:"user_id"`
	OrderID     *uint      `json:"order_id"`
	Subject     string     `gorm:"size:255;not null" json:"subject"`
	Description string     `gorm:"type:text" json:"description"`
	Priority    string     `gorm:"size:50;default:medium" json:"priority"`
	Status      string     `gorm:"size:50;default:open" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
}
