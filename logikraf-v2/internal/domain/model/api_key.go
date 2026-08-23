package model

import "time"

// APIKey authenticates external products (smarthub, etc.) to call the Payment Hub.
type APIKey struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Key         string     `gorm:"size:128;uniqueIndex;not null" json:"key"`
	Name        string     `gorm:"size:100" json:"name"`
	Description string     `gorm:"type:text" json:"description"`
	TenantID    *string    `gorm:"size:64;index" json:"tenant_id"`
	IsActive    bool       `gorm:"default:true" json:"is_active"`
	LastUsedAt  *time.Time `json:"last_used_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (APIKey) TableName() string { return "api_keys" }
