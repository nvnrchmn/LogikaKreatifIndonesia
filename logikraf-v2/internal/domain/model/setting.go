package model

import "time"

type Setting struct {
	Tenant    string    `gorm:"primaryKey;size:64;default:logikraf" json:"tenant"`
	Key       string    `gorm:"primaryKey;size:255" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
