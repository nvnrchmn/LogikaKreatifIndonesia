package model

import "time"

type Package struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	Slug        string    `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Tagline     string    `gorm:"size:255" json:"tagline"`
	Price       uint      `gorm:"not null" json:"price"`
	StrikePrice *uint     `json:"strike_price"`
	Features    StringList `gorm:"type:text;serializer:json" json:"features"`
	IsFeatured  bool      `gorm:"default:false" json:"is_featured"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
