package model

import "time"

type OrderTask struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OrderID     uint      `json:"order_id"`
	Title       string    `gorm:"size:255" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"size:50;default:pending" json:"status"`
	Position    int       `gorm:"default:0" json:"position"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
}
