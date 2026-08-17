package model

import "time"

type Service struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	Slug        string    `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	ShortDesc   string    `gorm:"size:500" json:"short_desc"`
	Content     string    `gorm:"type:text" json:"content"`
	Features    string    `gorm:"type:text" json:"features"` // newline-separated list for packages
	Color       string    `gorm:"size:50" json:"color"`
	Icon        string    `gorm:"type:text" json:"icon"`
	IsPackage   bool      `gorm:"default:false" json:"is_package"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
