package model

import "time"

// ClientNotification — notifikasi dalam portal klien (lonceng). Disimpan di DB
// supaya klien tetap bisa membacanya walau email masuk spam atau WA terlewat.
type ClientNotification struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	ClientID  uint       `gorm:"index" json:"client_id"`
	Title     string     `gorm:"size:150" json:"title"`
	Body      string     `gorm:"type:text" json:"body"`
	Link      string     `gorm:"size:200" json:"link"`
	ReadAt    *time.Time `json:"read_at"`
	CreatedAt time.Time  `json:"created_at"`
}
