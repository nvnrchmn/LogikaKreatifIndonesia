package model

import "time"

// Plan represents a subscription tier (starter/business/commerce).
type Plan struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Code       string    `gorm:"size:32;uniqueIndex" json:"code"`
	Name       string    `gorm:"size:80" json:"name"`
	PriceMonth int       `json:"price_month"`
	SetupFee   int       `json:"setup_fee"`
	CreatedAt  time.Time `json:"created_at"`
}

// Entitlement maps a plan to a feature flag.
type Entitlement struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	PlanID  uint   `gorm:"index" json:"plan_id"`
	Feature string `gorm:"size:64" json:"feature"`
	Enabled bool   `json:"enabled"`
}

// Tenant is a customer business (multi-tenant unit).
type Tenant struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Slug         string     `gorm:"size:64;uniqueIndex" json:"slug"`
	BusinessName string     `gorm:"size:160" json:"business_name"`
	Description  string     `gorm:"type:text" json:"description"`
	LogoURL      string     `gorm:"size:512" json:"logo_url"`
	FaviconURL   string     `gorm:"size:512" json:"favicon_url"`
	ContactEmail string     `gorm:"size:160" json:"contact_email"`
	ContactPhone string     `gorm:"size:40" json:"contact_phone"`
	Address      string     `gorm:"size:255" json:"address"`
	MapsEmbed    string     `gorm:"type:text" json:"maps_embed"`
	WhatsApp     string     `gorm:"size:40" json:"whatsapp"`
	Domain       string     `gorm:"size:255" json:"domain"`
	PlanID       uint       `json:"plan_id"`
	ThemeJSON    string     `gorm:"type:json" json:"theme_json"`
	SEOJSON      string     `gorm:"type:json" json:"seo_json"`
	SocialJSON   string     `gorm:"type:json" json:"social_json"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
