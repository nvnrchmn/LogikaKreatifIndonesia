package model

import "time"

// InvoiceReminder logs each reminder email attempt for an invoice.
// It exists so the system can (a) avoid emailing the same client repeatedly on
// the same day and (b) show the admin when a client was last chased.
type InvoiceReminder struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	InvoiceID    uint      `gorm:"index:idx_inv_created" json:"invoice_id"`
	SentTo       string    `gorm:"size:255" json:"sent_to"`
	DaysOverdue  int       `json:"days_overdue"`
	Outstanding  uint      `json:"outstanding"`
	Status       string    `gorm:"size:20;default:sent" json:"status"`
	ErrorMessage string    `gorm:"type:text" json:"error_message"`
	CreatedAt    time.Time `gorm:"index:idx_inv_created" json:"created_at"`
}
