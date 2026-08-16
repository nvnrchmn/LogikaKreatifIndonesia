package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// CreatePage creates a CMS page for a tenant (admin).
func CreatePage(c fiber.Ctx) error {
	var p model.Page
	if err := c.Bind().JSON(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	if err := model.DB.Create(&p).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(p)
}

// UpdatePage updates a CMS page (admin).
func UpdatePage(c fiber.Ctx) error {
	id := c.Params("id")
	var p model.Page
	if err := model.DB.First(&p, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "page not found"})
	}
	if err := c.Bind().JSON(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	model.DB.Save(&p)
	return c.JSON(p)
}

// CreateSection creates a section under a page (admin).
func CreateSection(c fiber.Ctx) error {
	var s model.Section
	if err := c.Bind().JSON(&s); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	if err := model.DB.Create(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(s)
}

// ListPages returns pages for a tenant (?tenant_id= query).
func ListPages(c fiber.Ctx) error {
	tid := c.Query("tenant_id")
	var pages []model.Page
	q := model.DB
	if tid != "" {
		q = q.Where("tenant_id = ?", tid)
	}
	q.Order("sort_order asc").Find(&pages)
	return c.JSON(pages)
}
