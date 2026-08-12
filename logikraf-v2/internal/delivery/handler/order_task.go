package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetOrderTasks(c fiber.Ctx) error {
	var items []model.OrderTask
	if err := model.DB.Order("position asc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func GetOrderTasksByOrder(c fiber.Ctx) error {
	var items []model.OrderTask
	if err := model.DB.Where("order_id = ?", c.Params("orderId")).Order("position asc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateOrderTask(c fiber.Ctx) error {
	var input model.OrderTask
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateOrderTask(c fiber.Ctx) error {
	var input model.OrderTask
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var t model.OrderTask
	if err := model.DB.First(&t, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	t.OrderID = input.OrderID
	t.Title = input.Title
	t.Description = input.Description
	t.Status = input.Status
	t.Position = input.Position
	model.DB.Save(&t)
	return c.JSON(t)
}

func DeleteOrderTask(c fiber.Ctx) error {
	if err := model.DB.Delete(&model.OrderTask{}, c.Params("id")).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"status": "deleted"})
}
