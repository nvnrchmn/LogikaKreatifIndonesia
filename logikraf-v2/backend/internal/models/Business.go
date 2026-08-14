package models

import "time"

type Business struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Slug        string         `json:"slug"`
	Logo        string         `json:"logo"`
	CoverImage  string         `json:"cover_image"`
	Description string         `json:"description"`
	Address     string         `json:"address"`
	GoogleMaps  string         `json:"google_maps"`
	Category    string         `json:"category"`
	Status      string         `json:"status"` // active, inactive
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   *time.Time     `json:"deleted_at,omitempty"`
}