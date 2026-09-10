package model

import "time"

// CronJob represents a scheduled background task managed from the admin panel.
// Enabling/disabling or changing the schedule does not require a service restart
// — the scheduler reloads jobs from this table.
type CronJob struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	JobKey         string     `gorm:"size:100;uniqueIndex;not null" json:"job_key"`
	Name           string     `gorm:"size:255;not null" json:"name"`
	Description    string     `gorm:"type:text" json:"description"`
	Schedule       string     `gorm:"size:100;not null" json:"schedule"`
	JobType        string     `gorm:"size:50;default:http" json:"job_type"`
	Endpoint       string     `gorm:"size:255" json:"endpoint"`
	IsEnabled      bool       `gorm:"column:is_enabled;default:true" json:"is_enabled"`
	LastRunAt      *time.Time `json:"last_run_at"`
	LastStatus     string     `gorm:"size:20" json:"last_status"`
	LastDurationMs uint       `json:"last_duration_ms"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func (CronJob) TableName() string { return "cron_jobs" }

// CronJobLog records the outcome of a single cron execution so the admin can
// see when a job ran, how long it took, and what it produced.
type CronJobLog struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	CronJobID    uint       `gorm:"index:idx_job_time;not null" json:"cron_job_id"`
	TriggeredAt  time.Time  `gorm:"index:idx_job_time;not null" json:"triggered_at"`
	FinishedAt   *time.Time `json:"finished_at"`
	DurationMs   uint       `json:"duration_ms"`
	Status       string     `gorm:"size:20;index:idx_status;not null" json:"status"`
	ResponseCode int        `json:"response_code"`
	Output       string     `gorm:"type:text" json:"output"`
	ErrorMessage string     `gorm:"type:text" json:"error_message"`
}

func (CronJobLog) TableName() string { return "cron_job_logs" }
