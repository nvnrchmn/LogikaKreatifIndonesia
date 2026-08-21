package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func CreatePackage(c fiber.Ctx) error {
	var p model.Package
	if err := c.Bind().JSON(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if len(p.Features) == 0 {
		p.Features = model.StringList{}
	}
	if err := model.DB.Create(&p).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(p)
}

func UpdatePackage(c fiber.Ctx) error {
	id := c.Params("id")
	var p model.Package
	if err := model.DB.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	var body model.Package
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	p.Name = body.Name
	p.Slug = body.Slug
	p.Tagline = body.Tagline
	p.Price = body.Price
	p.StrikePrice = body.StrikePrice
	p.Features = body.Features
	p.IsFeatured = body.IsFeatured
	p.IsActive = body.IsActive
	p.SortOrder = body.SortOrder
	model.DB.Save(&p)
	return c.JSON(p)
}

func DeletePackage(c fiber.Ctx) error {
	id := c.Params("id")
	model.DB.Delete(&model.Package{}, id)
	return c.SendStatus(204)
}
