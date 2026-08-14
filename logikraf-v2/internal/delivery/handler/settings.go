package handler

import (
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func resolveTenant(c fiber.Ctx) string {
	if t, ok := c.Locals("tenant").(string); ok && t != "" {
		return t
	}
	h := c.Host()
	if i := strings.Index(h, ":"); i >= 0 {
		h = h[:i]
	}
	h = strings.TrimPrefix(h, "www.")
	if h != "" && h != "localhost" && h != "127.0.0.1" {
		return h
	}
	return "logikraf"
}

func GetSetting(c fiber.Ctx) error {
	key := c.Params("key")
	tenant := resolveTenant(c)
	var s model.Setting
	if err := model.DB.First(&s, "tenant = ? AND `key` = ?", tenant, key).Error; err != nil {
		if tenant != "logikraf" {
			if err := model.DB.First(&s, "tenant = ? AND `key` = ?", "logikraf", key).Error; err == nil {
				return c.JSON(fiber.Map{"key": s.Key, "value": s.Value})
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(fiber.Map{"key": s.Key, "value": s.Value})
}

func SetSetting(c fiber.Ctx) error {
	key := c.Params("key")
	tenant := resolveTenant(c)
	var body struct {
		Value string `json:"value"`
	}
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}

	var s model.Setting
	// UPSERT: update existing or create new setting record
	if err := model.DB.Where("tenant = ? AND `key` = ?", tenant, key).First(&s).Error; err != nil {
		s = model.Setting{
			Tenant: tenant,
			Key:    key,
			Value:  body.Value,
		}
		if err := model.DB.Create(&s).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to create setting"})
		}
		return c.JSON(s)
	}

	s.Value = body.Value
	if err := model.DB.Save(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to update setting"})
	}
	return c.JSON(s)
}

func ListSettings(c fiber.Ctx) error {
	tenant := resolveTenant(c)
	var items []model.Setting
	if err := model.DB.Where("tenant = ?", tenant).Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	out := map[string]string{}
	// Jika tenant spesifik kosong atau parsial, lengkapi dengan default tenant logikraf
	if tenant != "logikraf" {
		var fallbackItems []model.Setting
		_ = model.DB.Where("tenant = ?", "logikraf").Find(&fallbackItems)
		for _, it := range fallbackItems {
			out[it.Key] = it.Value
		}
	}
	for _, it := range items {
		out[it.Key] = it.Value
	}
	return c.JSON(out)
}
