package models

import "time"

type Transaction struct {
	ID             string             `json:"id"`
	OrderID        string             `json:"order_id"`
	BusinessID     string             `json:"business_id"`
	Amount         float64            `json:"amount"`
	Fee            float64            `json:"fee"`
	NetAmount      float64            `json:"net_amount"`
	PaymentGateway string             `json:"payment_gateway"` // midtrans, xendit
	Status         string             `json:"status"` // pending, success, failed, refunded
	VaNumber       string             `json:"va_number"`
	TransferAmount float64            `json:"transfer_amount"`
	RefundAmount   float64            `json:"refund_amount"`
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
	Refunds        []TransactionRefund `json:"refunds,omitempty"`
}

type TransactionRefund struct {
	ID             string    `json:"id"`
	TransactionID  string    `json:"transaction_id"`
	Amount         float64   `json:"amount"`
	Reason         string    `json:"reason"`
	CreatedAt      time.Time `json:"created_at"`
	RefundedAt     *time.Time `json:"refunded_at"`
}