package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetOrders(c fiber.Ctx) error {
	var items []model.Order
	if err := model.DB.Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateOrder(c fiber.Ctx) error {
	var input model.Order
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if input.OrderNumber == "" {
		return c.Status(400).JSON(fiber.Map{"error": "order_number required"})
	}
	if input.Status == "" {
		input.Status = "pending"
	}
	if v, ok := c.Locals("user_id").(uint); ok {
		input.UserID = v
	}
	if err := model.DB.Create(&input).Error; err != nil {
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
	var o model.Order
	if err := model.DB.First(&o, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	o.ProjectName = input.ProjectName
	o.TotalAmount = input.TotalAmount
	o.Status = input.Status
	o.MilestoneStatus = input.MilestoneStatus
	model.DB.Save(&o)
	return c.JSON(o)
}

func DeleteOrder(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Order{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
