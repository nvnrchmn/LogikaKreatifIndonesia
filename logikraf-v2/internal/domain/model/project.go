package model

import "time"

type Project struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	PackageID   uint       `json:"package_id"`
	OrderID     uint       `json:"order_id"`
	ClientID    uint       `json:"client_id"`
	Name        string     `gorm:"size:255;not null" json:"name"`
	Description string     `gorm:"type:text" json:"description"`
	Status      string     `gorm:"size:50;not null;default:planning" json:"status"`
	StartDate   *time.Time `json:"start_date"`
	Deadline    *time.Time `json:"deadline"`
	RepoURL     string     `gorm:"size:500" json:"repo_url"`
	LiveURL     string     `gorm:"size:500" json:"live_url"`
	SortOrder   int        `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `gorm:"index" json:"-"`
}
