package model

import "time"

// ProjectTemplate stores metadata for a pre-built project template tied to a
// Package. When an Order is placed for that Package, the referenced template
// (built artifact on S3) is fetched and extracted into the new project folder.
type ProjectTemplate struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PackageID   uint      `json:"package_id"`
	Package     Package   `gorm:"foreignKey:PackageID" json:"package,omitempty"`
	Name        string    `gorm:"size:255;not null" json:"name"`
	RepoURL     string    `gorm:"size:500" json:"repo_url"`     // GitHub repo
	ArtifactKey string    `gorm:"size:500" json:"artifact_key"` // S3 object key of built .tar.gz
	Description string    `gorm:"type:text" json:"description"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
