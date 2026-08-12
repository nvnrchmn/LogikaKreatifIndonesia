package model

import "time"

type Portfolio struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ServiceID    uint      `json:"service_id"`
	Title        string    `gorm:"size:255;not null" json:"title"`
	Slug         string    `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Excerpt      string    `gorm:"size:500" json:"excerpt"`
	Description  string    `gorm:"type:text" json:"description"`
	ClientName   string    `gorm:"size:255" json:"client_name"`
	ProjectURL   string    `gorm:"size:500" json:"project_url"`
	Thumbnail    string    `gorm:"size:500" json:"thumbnail"`
	IsPublished  bool      `gorm:"default:true" json:"is_published"`
	IsFeatured   bool      `gorm:"default:false" json:"is_featured"`
	SortOrder    int       `gorm:"default:0" json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	DeletedAt    *time.Time `gorm:"index" json:"-"`
}
