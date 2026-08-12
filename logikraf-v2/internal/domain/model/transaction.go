package model

import "time"

type Transaction struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	OrderID             uint      `json:"order_id"`
	TransactionReference string   `gorm:"size:100;uniqueIndex" json:"transaction_reference"`
	MilestoneName       string    `gorm:"size:255" json:"milestone_name"`
	Amount              uint      `json:"amount"`
	PaymentMethod       string    `gorm:"size:100" json:"payment_method"`
	Status              string    `gorm:"size:50;default:pending" json:"status"`
	SettledAt           *time.Time `json:"settled_at"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	DeletedAt           *time.Time `gorm:"index" json:"-"`
}
