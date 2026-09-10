package model

import "time"

// Page is a CMS page within a tenant website.
type Page struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TenantID  uint      `gorm:"uniqueIndex:uk_tenant_page;index" json:"tenant_id"`
	Slug      string    `gorm:"size:64;uniqueIndex:uk_tenant_page" json:"slug"`
	Title     string    `gorm:"size:160" json:"title"`
	MetaJSON  string    `gorm:"type:json" json:"meta_json"`
	Published bool      `gorm:"default:true" json:"published"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}

// Section is a content block within a page.
type Section struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	PageID      uint   `gorm:"index" json:"page_id"`
	Type        string `gorm:"size:64" json:"type"`
	ContentJSON string `gorm:"type:json" json:"content_json"`
	SortOrder   int    `gorm:"default:0" json:"sort_order"`
}

// Media is an uploaded asset for a tenant.
type Media struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TenantID  uint      `gorm:"index" json:"tenant_id"`
	URL       string    `gorm:"size:512" json:"url"`
	Alt       string    `gorm:"size:160" json:"alt"`
	CreatedAt time.Time `json:"created_at"`
}
