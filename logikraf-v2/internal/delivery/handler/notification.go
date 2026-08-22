package handler

import (
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

// GetNotifications returns unread notifications for admin panel.
func GetNotifications(c fiber.Ctx) error {
	var items []model.Notification
	if err := model.DB.Where("is_read = ?", false).Order("created_at desc").Limit(50).Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// GetNotificationCount returns unread notification count.
func GetNotificationCount(c fiber.Ctx) error {
	var count int64
	model.DB.Model(&model.Notification{}).Where("is_read = ?", false).Count(&count)
	return c.JSON(fiber.Map{"count": count})
}

// MarkNotificationRead marks a notification as read.
func MarkNotificationRead(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Model(&model.Notification{}).Where("id = ?", id).Update("is_read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"status": "ok"})
}

// MarkAllNotificationsRead marks all notifications as read.
func MarkAllNotificationsRead(c fiber.Ctx) error {
	if err := model.DB.Model(&model.Notification{}).Where("is_read = ?", false).Update("is_read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"status": "ok"})
}

// CreateProjectFromPayment creates a project from a payment notification.
func CreateProjectFromPayment(c fiber.Ctx) error {
	notifID := c.Params("id")

	// Get the notification
	var notif model.Notification
	if err := model.DB.First(&notif, notifID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "notification not found"})
	}

	// Bind project input
	var in struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		StartDate   string `json:"start_date"`
		Deadline    string `json:"deadline"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}

	// Get the payment transaction
	var pt model.PaymentTransaction
	if err := model.DB.First(&pt, notif.RefID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "payment not found"})
	}

	// Find or create client
	var client model.Client
	if err := model.DB.Where("email = ?", pt.ClientEmail).First(&client).Error; err != nil {
		client = model.Client{
			PICName: pt.ClientName,
			Email:   pt.ClientEmail,
			Phone:   pt.ClientPhone,
		}
		model.DB.Create(&client)
	}

	// Parse dates
	var startDate, deadline *time.Time
	if in.StartDate != "" {
		d, err := time.Parse("2006-01-02", in.StartDate)
		if err == nil {
			startDate = &d
		}
	}
	if in.Deadline != "" {
		d, err := time.Parse("2006-01-02", in.Deadline)
		if err == nil {
			deadline = &d
		}
	}

	// Create project
	project := model.Project{
		ClientID:    client.ID,
		Name:        in.Name,
		Description: in.Description,
		Status:      "planning",
		StartDate:   startDate,
		Deadline:    deadline,
	}
	if err := model.DB.Create(&project).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	// Mark notification as read
	notif.IsRead = true
	model.DB.Save(&notif)

	return c.Status(201).JSON(project)
}
