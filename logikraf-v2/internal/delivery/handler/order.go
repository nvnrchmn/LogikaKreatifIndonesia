package handler

import (
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetOrders(c fiber.Ctx) error {
	var items []model.Order
	query := model.DB.Order("created_at desc")
	if c.Locals("role") != "admin" {
		userID, ok := c.Locals("user_id").(uint)
		if !ok || userID == 0 {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		query = query.Where("user_id = ?", userID)
	}
	if err := query.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateOrder(c fiber.Ctx) error {
	var input model.Order
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	input.ProjectName = strings.TrimSpace(input.ProjectName)
	if input.OrderNumber == "" {
		return c.Status(400).JSON(fiber.Map{"error": "order_number required"})
	}
	if input.ProjectName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "project_name required"})
	}
	if input.ClientID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "client_id required"})
	}
	var client model.Client
	if err := model.DB.First(&client, input.ClientID).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "client not found"})
	}
	if input.Status == "" {
		input.Status = "pending"
	}
	if v, ok := c.Locals("user_id").(uint); ok {
		input.UserID = v
	}
	if input.PackageID != 0 {
		var pkg model.Package
		if err := model.DB.First(&pkg, input.PackageID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "package not found"})
		}
	}
	tx := model.DB.Begin()
	if tx.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Create(&input).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	project := model.Project{
		PackageID: input.PackageID,
		OrderID:   input.ID,
		ClientID:  input.ClientID,
		Name:      input.ProjectName,
		Status:    "planning",
	}
	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateOrder(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Order
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	input.ProjectName = strings.TrimSpace(input.ProjectName)
	if input.ProjectName == "" {
		return c.Status(400).JSON(fiber.Map{"error": "project_name required"})
	}
	var o model.Order
	if err := model.DB.First(&o, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	if input.ClientID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "client_id required"})
	}
	var client model.Client
	if err := model.DB.First(&client, input.ClientID).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "client not found"})
	}
	o.ProjectName = input.ProjectName
	o.ClientID = input.ClientID
	o.TotalAmount = input.TotalAmount
	o.Status = input.Status
	o.MilestoneStatus = input.MilestoneStatus
	if input.PackageID != 0 {
		var pkg model.Package
		if err := model.DB.First(&pkg, input.PackageID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "package not found"})
		}
		o.PackageID = input.PackageID
	}
	tx := model.DB.Begin()
	if tx.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Save(&o).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	// Sync linked project: update it if it exists, otherwise recreate it so
	// legacy orders (created before projects existed) stay consistent.
	// Use an explicit existence check instead of RowsAffected (MySQL without
	// CLIENT_FOUND_ROWS reports 0 rows for no-op updates, which would cause
	// duplicate project rows).
	var existing model.Project
	projectErr := tx.Where("order_id = ?", o.ID).First(&existing).Error
	if projectErr == nil {
		if err := tx.Model(&existing).Updates(map[string]any{
			"name": o.ProjectName, "client_id": o.ClientID, "package_id": o.PackageID,
		}).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
	} else {
		project := model.Project{
			PackageID: o.PackageID,
			OrderID:   o.ID,
			ClientID:  o.ClientID,
			Name:      o.ProjectName,
			Status:    "planning",
		}
		if err := tx.Create(&project).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
	}
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(o)
}

func DeleteOrder(c fiber.Ctx) error {
	id := c.Params("id")
	var order model.Order
	if err := model.DB.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	tx := model.DB.Begin()
	if tx.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Delete(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Where("order_id = ?", order.ID).Delete(&model.Project{}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := tx.Commit().Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
