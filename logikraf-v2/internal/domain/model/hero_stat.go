package model

import "time"

type HeroStat struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Num       string    `gorm:"size:64;not null" json:"num"`
	Label     string    `gorm:"size:255;not null" json:"label"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
