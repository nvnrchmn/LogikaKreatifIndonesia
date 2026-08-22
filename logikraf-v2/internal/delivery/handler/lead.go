package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetLeads(c fiber.Ctx) error {
	var items []model.Lead
	if err := model.DB.Order("created_at desc").Limit(1000).Find(&items).Error; err != nil { // Max 1000 rows. If dataset grows, implement pagination.
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateLead(c fiber.Ctx) error {
	var input model.Lead
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateLead(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Lead
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var l model.Lead
	if err := model.DB.First(&l, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	l.Name = input.Name
	l.Email = input.Email
	l.Company = input.Company
	l.ServiceCategory = input.ServiceCategory
	l.Notes = input.Notes
	l.Status = input.Status
	l.LeadScore = input.LeadScore
	if err := model.DB.Save(&l).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(l)
}

func DeleteLead(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Lead{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
