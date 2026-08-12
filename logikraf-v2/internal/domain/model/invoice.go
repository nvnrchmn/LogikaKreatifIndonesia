package model

import "time"

type Invoice struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	OrderID       *uint      `json:"order_id"`
	InvoiceNumber string     `gorm:"size:100;uniqueIndex" json:"invoice_number"`
	Type          string     `gorm:"size:20;default:invoice" json:"type"`
	Total         uint       `json:"total"`
	Status        string     `gorm:"size:20;default:draft" json:"status"`
	IssueDate     *time.Time `json:"issue_date"`
	DueDate       *time.Time `json:"due_date"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `gorm:"index" json:"-"`
}
