package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetTransactions(c fiber.Ctx) error {
	var items []model.Transaction
	if err := model.DB.Order("created_at desc").Limit(1000).Find(&items).Error; err != nil { // Max 1000 rows. If dataset grows, implement pagination.
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func GetTransactionByID(c fiber.Ctx) error {
	var item model.Transaction
	if err := model.DB.First(&item, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(item)
}

func CreateTransaction(c fiber.Ctx) error {
	var input model.Transaction
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateTransaction(c fiber.Ctx) error {
	var input model.Transaction
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var tx model.Transaction
	if err := model.DB.First(&tx, c.Params("id")).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	tx.OrderID = input.OrderID
	tx.TransactionReference = input.TransactionReference
	tx.MilestoneName = input.MilestoneName
	tx.Amount = input.Amount
	tx.PaymentMethod = input.PaymentMethod
	tx.Status = input.Status
	tx.SettledAt = input.SettledAt
	if err := model.DB.Save(&tx).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(tx)
}

func DeleteTransaction(c fiber.Ctx) error {
	if err := model.DB.Delete(&model.Transaction{}, c.Params("id")).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"status": "deleted"})
}
