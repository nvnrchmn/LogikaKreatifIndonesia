package handler

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

var validProjectStatuses = map[string]bool{
	"planning": true, "in_progress": true, "review": true,
	"completed": true, "on_hold": true, "cancelled": true,
}

func validateProjectReferences(input *model.Project) error {
	if input.ClientID != 0 {
		var client model.Client
		if err := model.DB.First(&client, input.ClientID).Error; err != nil {
			return fiber.ErrBadRequest
		}
	}
	if input.PackageID != 0 {
		var pkg model.Package
		if err := model.DB.First(&pkg, input.PackageID).Error; err != nil {
			return fiber.ErrBadRequest
		}
	}
	if input.OrderID != 0 {
		var order model.Order
		if err := model.DB.First(&order, input.OrderID).Error; err != nil {
			return fiber.ErrBadRequest
		}
		if input.ClientID != 0 && input.ClientID != order.ClientID {
			return fiber.ErrBadRequest
		}
		if input.PackageID != 0 && input.PackageID != order.PackageID {
			return fiber.ErrBadRequest
		}
	}
	return nil
}

func GetProjects(c fiber.Ctx) error {
	var items []model.Project
	query := model.DB.Order("sort_order asc, created_at desc")
	if status := c.Query("status"); status != "" {
		if !validProjectStatuses[status] {
			return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
		}
		query = query.Where("status = ?", status)
	}
	if err := query.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func GetProjectByID(c fiber.Ctx) error {
	var item model.Project
	if err := model.DB.First(&item, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(item)
}

func CreateProject(c fiber.Ctx) error {
	var input model.Project
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	input.Name = strings.TrimSpace(input.Name)
	if input.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name required"})
	}
	if input.Status == "" {
		input.Status = "planning"
	}
	if !validProjectStatuses[input.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
	}
	if input.OrderID != 0 {
		var order model.Order
		if err := model.DB.First(&order, input.OrderID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid project references"})
		}
		if input.ClientID != 0 && input.ClientID != order.ClientID {
			return c.Status(400).JSON(fiber.Map{"error": "project client does not match order"})
		}
		if input.PackageID != 0 && input.PackageID != order.PackageID {
			return c.Status(400).JSON(fiber.Map{"error": "project package does not match order"})
		}
		input.ClientID = order.ClientID
		input.PackageID = order.PackageID
	}
	if err := validateProjectReferences(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid project references"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateProject(c fiber.Ctx) error {
	var item model.Project
	if err := model.DB.First(&item, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	var input model.Project
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	input.Name = strings.TrimSpace(input.Name)
	if input.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name required"})
	}
	if input.Status == "" {
		input.Status = item.Status
	}
	if !validProjectStatuses[input.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
	}
	input.OrderID = item.OrderID
	if input.ClientID == 0 {
		input.ClientID = item.ClientID
	}
	if input.PackageID == 0 {
		input.PackageID = item.PackageID
	}
	if err := validateProjectReferences(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid project references"})
	}

	item.Name, item.Description, item.Status = input.Name, input.Description, input.Status
	item.ClientID, item.PackageID = input.ClientID, input.PackageID
	item.StartDate, item.Deadline = input.StartDate, input.Deadline
	item.RepoURL, item.LiveURL, item.SortOrder = input.RepoURL, input.LiveURL, input.SortOrder

	tx := model.DB.Begin()
	if tx.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Save(&item).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if item.OrderID != 0 {
		orderUpdate := tx.Model(&model.Order{}).Where("id = ?", item.OrderID).Updates(map[string]any{
			"project_name": item.Name,
			"client_id":    item.ClientID,
			"package_id":   item.PackageID,
		})
		if orderUpdate.Error != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
		if orderUpdate.RowsAffected != 1 {
			tx.Rollback()
			return c.Status(400).JSON(fiber.Map{"error": "linked order not found"})
		}
	}
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(item)
}

func DeleteProject(c fiber.Ctx) error {
	var item model.Project
	if err := model.DB.First(&item, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	if item.OrderID != 0 {
		return c.Status(409).JSON(fiber.Map{"error": "project linked to order; delete the order instead"})
	}
	if err := model.DB.Delete(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
