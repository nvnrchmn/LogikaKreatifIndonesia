package models

import "time"

type Service struct {
	ID               string         `json:"id"`
	Name             string         `json:"name"`
	Slug             string         `json:"slug"`
	Icon             string         `json:"icon"`
	CoverImage       string         `json:"cover_image"`
	ShortDescription string         `json:"short_description"`
	Description      string         `json:"description"` // rich text
	IsPublished      bool           `json:"is_published"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        *time.Time     `json:"deleted_at,omitempty"`
}

type ServiceFeature struct {
	ID          string `json:"id"`
	ServiceID   string `json:"service_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	OrderNo     int    `json:"order_no"`
}