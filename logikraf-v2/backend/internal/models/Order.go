package models

import "time"

type Order struct {
	ID              string           `json:"id"`
	BusinessID      string           `json:"business_id"`
	ServiceID       string           `json:"service_id"`
	ClientName      string           `json:"client_name"`
	ClientEmail     string           `json:"client_email"`
	ClientPhone     string           `json:"client_phone"`
	QuoteAmount     float64          `json:"quote_amount"`
	FinalAmount     float64          `json:"final_amount"`
	Status          string           `json:"status"` // draft, sent, accepted, rejected, completed
	PaymentGateway  string           `json:"payment_gateway"` // midtrans, xendit
	TransactionID   string           `json:"transaction_id"`
	Notes           string           `json:"notes"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	DeletedAt       *time.Time       `json:"deleted_at,omitempty"`
}

type OrderItem struct {
	ID      string `json:"id"`
	OrderID string `json:"order_id"`
	Name    string `json:"name"`
	Price   int    `json:"price"`
	Qty     int    `json:"qty"`
}