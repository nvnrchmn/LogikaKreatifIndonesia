package models

import "time"

type Invoice struct {
	ID            string         `json:"id"`
	OrderID       string         `json:"order_id"`
	BusinessID    string         `json:"business_id"`
	InvoiceNo     string         `json:"invoice_no"`
	IssueDate     string         `json:"issue_date"`
	DueDate       string         `json:"due_date"`
	TotalAmount   float64        `json:"total_amount"`
	Status        string         `json:"status"` // draft, sent, paid, overdue
	PDFPath       string         `json:"pdf_path"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	Items         []InvoiceItem  `json:"items,omitempty"`
}

type InvoiceItem struct {
	ID        string `json:"id"`
	InvoiceID string `json:"invoice_id"`
	Name      string `json:"name"`
	Qty       int    `json:"qty"`
	Price     int    `json:"price"`
	Total     int    `json:"total"`
}