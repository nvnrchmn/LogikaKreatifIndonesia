package model

import "time"

// TicketReply — satu balasan dalam percakapan tiket (dari klien maupun admin).
type TicketReply struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	TicketID   uint      `gorm:"index" json:"ticket_id"`
	UserID     uint      `json:"user_id"`
	Author     string    `gorm:"size:20;default:client" json:"author"`
	AuthorName string    `gorm:"size:150" json:"author_name"`
	Body       string    `gorm:"type:text" json:"body"`
	CreatedAt  time.Time `json:"created_at"`
}
