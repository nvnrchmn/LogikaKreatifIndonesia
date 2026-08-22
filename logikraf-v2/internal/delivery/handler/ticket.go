package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetTickets(c fiber.Ctx) error {
	var items []model.Ticket
	if err := model.DB.Order("created_at desc").Limit(1000).Find(&items).Error; err != nil { // Max 1000 rows. If dataset grows, implement pagination.
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateTicket(c fiber.Ctx) error {
	var input model.Ticket
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if input.Subject == "" {
		return c.Status(400).JSON(fiber.Map{"error": "subject required"})
	}
	if input.Status == "" {
		input.Status = "open"
	}
	if v, ok := c.Locals("user_id").(uint); ok {
		input.UserID = v
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateTicket(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Ticket
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var t model.Ticket
	if err := model.DB.First(&t, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	t.Subject = input.Subject
	t.Description = input.Description
	t.Priority = input.Priority
	t.Status = input.Status
	if err := model.DB.Save(&t).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(t)
}

func DeleteTicket(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Ticket{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
