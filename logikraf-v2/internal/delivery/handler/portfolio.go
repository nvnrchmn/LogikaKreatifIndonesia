package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetPortfolios(c fiber.Ctx) error {
	var items []model.Portfolio
	if err := model.DB.Order("sort_order desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreatePortfolio(c fiber.Ctx) error {
	var input model.Portfolio
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if input.ServiceID == 0 {
		input.ServiceID = 1
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdatePortfolio(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Portfolio
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var p model.Portfolio
	if err := model.DB.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	p.Title = input.Title
	p.Slug = input.Slug
	p.Excerpt = input.Excerpt
	p.Description = input.Description
	p.ClientName = input.ClientName
	p.Thumbnail = input.Thumbnail
	p.IsPublished = input.IsPublished
	model.DB.Save(&p)
	return c.JSON(p)
}

func DeletePortfolio(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Portfolio{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
