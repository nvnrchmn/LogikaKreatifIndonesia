package model

import "time"

// Invoice is a billable document for an order.
//
// PaidAmount tracks how much has actually been received so partial payments
// (DP / termin) are first-class: Total - PaidAmount is the outstanding balance.
// Without it the app could only express "paid" or "not paid", which cannot
// represent a deposit followed by a final settlement.
type Invoice struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	OrderID       *uint      `json:"order_id"`
	InvoiceNumber string     `gorm:"size:100;uniqueIndex" json:"invoice_number"`
	Type          string     `gorm:"size:20;default:invoice" json:"type"`
	Total         uint       `json:"total"`
	PaidAmount    uint       `gorm:"default:0" json:"paid_amount"`
	Status        string     `gorm:"size:20;default:draft" json:"status"`
	Notes         string     `gorm:"type:text" json:"notes"`
	IssueDate     *time.Time `json:"issue_date"`
	DueDate       *time.Time `json:"due_date"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `gorm:"index" json:"-"`
}

// Outstanding returns how much is still owed on this invoice.
func (i Invoice) Outstanding() uint {
	if i.PaidAmount >= i.Total {
		return 0
	}
	return i.Total - i.PaidAmount
}

// DeriveStatus returns the status implied by the amounts and due date.
// Money received is the source of truth, so status is computed rather than
// hand-set: this prevents an invoice reading "paid" while the balance is unpaid.
// A draft invoice has not been issued yet, so it is never auto-aged to overdue.
func (i Invoice) DeriveStatus(now time.Time) string {
	if i.Total > 0 && i.PaidAmount >= i.Total {
		return "paid"
	}
	if i.PaidAmount > 0 {
		return "partial"
	}
	if i.Status == "draft" {
		return "draft"
	}
	if i.DueDate != nil && now.After(*i.DueDate) {
		return "overdue"
	}
	if i.Status == "" {
		return "draft"
	}
	return i.Status
}
