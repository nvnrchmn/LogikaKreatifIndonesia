package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func CreateService(c fiber.Ctx) error {
	var s model.Service
	if err := c.Bind().JSON(&s); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if err := model.DB.Create(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(s)
}

func UpdateService(c fiber.Ctx) error {
	id := c.Params("id")
	var s model.Service
	if err := model.DB.First(&s, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	var body model.Service
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	s.Name = body.Name
	s.Slug = body.Slug
	s.ShortDesc = body.ShortDesc
	s.Content = body.Content
	s.Color = body.Color
	s.Icon = body.Icon
	s.IsActive = body.IsActive
	s.SortOrder = body.SortOrder
	model.DB.Save(&s)
	return c.JSON(s)
}

func DeleteService(c fiber.Ctx) error {
	id := c.Params("id")
	model.DB.Delete(&model.Service{}, id)
	return c.SendStatus(204)
}
