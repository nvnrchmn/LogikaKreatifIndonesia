package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// GetTemplates lists project templates, optionally filtered by package_id.
func GetTemplates(c fiber.Ctx) error {
	packageID := c.Query("package_id")
	var items []model.ProjectTemplate
	query := model.DB
	if packageID != "" {
		query = query.Where("package_id = ?", packageID)
	}
	if err := query.Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// CreateTemplate creates a project template (admin only).
func CreateTemplate(c fiber.Ctx) error {
	var input model.ProjectTemplate
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if input.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name required"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

// UpdateTemplate updates an existing template.
func UpdateTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	var t model.ProjectTemplate
	if err := model.DB.First(&t, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	var body model.ProjectTemplate
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	t.Name = body.Name
	t.RepoURL = body.RepoURL
	t.ArtifactKey = body.ArtifactKey
	t.Description = body.Description
	t.IsActive = body.IsActive
	if body.PackageID != 0 {
		t.PackageID = body.PackageID
	}
	if err := model.DB.Save(&t).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(t)
}

// DeleteTemplate removes a template.
func DeleteTemplate(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.ProjectTemplate{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
