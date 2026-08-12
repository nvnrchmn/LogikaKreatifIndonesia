package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetClients(c fiber.Ctx) error {
	var items []model.Client
	if err := model.DB.Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateClient(c fiber.Ctx) error {
	var input model.Client
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateClient(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Client
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var c1 model.Client
	if err := model.DB.First(&c1, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	c1.CompanyName = input.CompanyName
	c1.PICName = input.PICName
	c1.Email = input.Email
	c1.Phone = input.Phone
	c1.City = input.City
	c1.Address = input.Address
	model.DB.Save(&c1)
	return c.JSON(c1)
}

func DeleteClient(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Client{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}
