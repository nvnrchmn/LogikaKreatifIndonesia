package model

import "time"

// ProcessedWebhook tracks processed webhook events to prevent duplicate processing.
type ProcessedWebhook struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	WebhookID  string    `gorm:"size:255;uniqueIndex:uniq_webhook_provider" json:"webhook_id"`
	Provider   string    `gorm:"size:50;uniqueIndex:uniq_webhook_provider" json:"provider"`
	CreatedAt  time.Time `json:"created_at"`
}
