package model

import "time"

type Testimonial struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	Role        string    `gorm:"size:255" json:"role"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	Avatar      string    `gorm:"size:500" json:"avatar"`
	IsApproved  bool      `gorm:"default:false" json:"is_approved"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
