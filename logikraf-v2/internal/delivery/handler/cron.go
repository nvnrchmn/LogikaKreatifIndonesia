package handler

import (
	"context"
	"strconv"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	sched "github.com/logikraf/logikraf-v2/pkg/scheduler"

	"github.com/gofiber/fiber/v3"
)

// CronHandler manages scheduled background jobs.
type CronHandler struct {
	sched *sched.Scheduler
}

func NewCronHandler(s *sched.Scheduler) *CronHandler {
	return &CronHandler{sched: s}
}

// ListCronJobs returns all scheduled jobs with their last run status.
func (h *CronHandler) ListCronJobs(c fiber.Ctx) error {
	var jobs []model.CronJob
	if err := model.DB.Order("id").Find(&jobs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(jobs)
}

// UpdateCronJob enables/disables or changes a job's schedule.
func (h *CronHandler) UpdateCronJob(c fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		IsEnabled *bool   `json:"is_enabled"`
		Schedule  *string `json:"schedule"`
		Name      *string `json:"name"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}

	var job model.CronJob
	if err := model.DB.First(&job, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	if in.IsEnabled != nil {
		job.IsEnabled = *in.IsEnabled
	}
	if in.Schedule != nil && *in.Schedule != "" {
		job.Schedule = *in.Schedule
	}
	if in.Name != nil && *in.Name != "" {
		job.Name = *in.Name
	}

	if err := model.DB.Save(&job).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	// Reload scheduler so changes take effect immediately.
	if h.sched != nil {
		h.sched.Reload()
	}

	return c.JSON(job)
}

// RunCronJob triggers a job immediately (bypasses schedule).
func (h *CronHandler) RunCronJob(c fiber.Ctx) error {
	if h.sched == nil {
		return c.Status(500).JSON(fiber.Map{"error": "scheduler not running"})
	}

	key := c.Params("key")
	if key == "" {
		return c.Status(400).JSON(fiber.Map{"error": "job key required"})
	}

	now := time.Now()
	status := "success"
	errMsg := ""

	if err := h.sched.RunOnce(context.Background(), key); err != nil {
		status = "failed"
		errMsg = err.Error()
	}

	// Log the manual run.
	var job model.CronJob
	if err := model.DB.Where("job_key = ?", key).First(&job).Error; err == nil {
		finished := time.Now()
		model.DB.Create(&model.CronJobLog{
			CronJobID:    job.ID,
			TriggeredAt:  now,
			FinishedAt:   &finished,
			DurationMs:   uint(finished.Sub(now).Milliseconds()),
			Status:       status,
			Output:       "Manual run via admin panel",
			ErrorMessage: errMsg,
		})
	}

	if status == "failed" {
		return c.Status(502).JSON(fiber.Map{"error": errMsg})
	}
	return c.JSON(fiber.Map{"status": "triggered", "job_key": key})
}

// ListCronJobLogs returns recent execution logs for a job.
func (h *CronHandler) ListCronJobLogs(c fiber.Ctx) error {
	jobID := c.Params("id")
	limit := 20
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}

	var logs []model.CronJobLog
	if err := model.DB.Where("cron_job_id = ?", jobID).
		Order("triggered_at desc").Limit(limit).Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(logs)
}
