package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetServices(c fiber.Ctx) error {
	var services []model.Service
	if err := model.DB.Find(&services).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(services)
}

func GetServiceBySlug(c fiber.Ctx) error {
	slug := c.Params("slug")
	var service model.Service
	if err := model.DB.Where("slug = ?", slug).First(&service).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(service)
}
