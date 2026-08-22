package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetPortfolios(c fiber.Ctx) error {
	var items []model.Portfolio
	if err := model.DB.Order("sort_order desc").Limit(1000).Find(&items).Error; err != nil { // Max 1000 rows. If dataset grows, implement pagination.
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreatePortfolio(c fiber.Ctx) error {
	var input model.Portfolio
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var dup model.Portfolio
	if err := model.DB.Where("slug = ?", input.Slug).First(&dup).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "slug sudah digunakan, gunakan slug lain"})
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
	var dup model.Portfolio
	if err := model.DB.Where("slug = ? AND id <> ?", input.Slug, id).First(&dup).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "slug sudah digunakan, gunakan slug lain"})
	}
	p.Title = input.Title
	p.Slug = input.Slug
	p.Excerpt = input.Excerpt
	p.Description = input.Description
	p.ClientName = input.ClientName
	p.Thumbnail = input.Thumbnail
	p.IsPublished = input.IsPublished
	if err := model.DB.Save(&p).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(p)
}

func DeletePortfolio(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Portfolio{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
