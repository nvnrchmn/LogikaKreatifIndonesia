package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetTestimonials(c fiber.Ctx) error {
	var items []model.Testimonial
	if err := model.DB.Order("sort_order desc").Limit(1000).Find(&items).Error; err != nil { // Max 1000 rows. If dataset grows, implement pagination.
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateTestimonial(c fiber.Ctx) error {
	var input model.Testimonial
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateTestimonial(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Testimonial
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var t model.Testimonial
	if err := model.DB.First(&t, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	t.Name = input.Name
	t.Role = input.Role
	t.Content = input.Content
	t.Avatar = input.Avatar
	t.IsApproved = input.IsApproved
	t.SortOrder = input.SortOrder
	if err := model.DB.Save(&t).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(t)
}

func DeleteTestimonial(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Testimonial{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
