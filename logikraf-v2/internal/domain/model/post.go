package model

import "time"

type Post struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	Title         string     `gorm:"size:255;not null" json:"title"`
	Slug          string     `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Excerpt       string     `gorm:"type:text" json:"excerpt"`
	Body          string     `gorm:"type:text" json:"body"`
	FeaturedImage string     `gorm:"size:500" json:"featured_image"`
	IsPublished   bool       `gorm:"default:false" json:"is_published"`
	PublishedAt   *time.Time `json:"published_at"`
	AuthorID      uint       `json:"author_id"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `gorm:"index" json:"-"`
}
