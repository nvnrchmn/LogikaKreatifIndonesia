package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetSetting(c fiber.Ctx) error {
	key := c.Params("key")
	tenant := c.Locals("tenant").(string)
	var s model.Setting
	if err := model.DB.First(&s, "tenant = ? AND `key` = ?", tenant, key).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(fiber.Map{"key": s.Key, "value": s.Value})
}

func SetSetting(c fiber.Ctx) error {
	key := c.Params("key")
	tenant := c.Locals("tenant").(string)
	var body struct {
		Value string `json:"value"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var s model.Setting
	if err := model.DB.First(&s, "tenant = ? AND `key` = ?", tenant, key).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	s.Value = body.Value
	if err := model.DB.Save(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(s)
}

func ListSettings(c fiber.Ctx) error {
	tenant := c.Locals("tenant").(string)
	var items []model.Setting
	if err := model.DB.Where("tenant = ?", tenant).Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	out := map[string]string{}
	for _, it := range items {
		out[it.Key] = it.Value
	}
	return c.JSON(out)
}
