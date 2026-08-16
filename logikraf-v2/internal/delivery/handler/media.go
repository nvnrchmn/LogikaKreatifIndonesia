package handler

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/delivery/middleware"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// UploadMedia saves a file to the tenant upload dir and returns its URL.
// Served via /media/* (Host-aware, see cmd/server).
func UploadMedia(c fiber.Ctx) error {
	tenantID, ok := c.Locals("tenant_id").(uint)
	if !ok {
		tid := c.Query("tenant_id")
		if tid == "" {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var t model.Tenant
		if err := model.DB.First(&t, tid).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "tenant not found"})
		}
		tenantID = t.ID
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "no file"})
	}
	name := filepath.Base(file.Filename)
	name = strings.ReplaceAll(name, " ", "_")
	dir := middleware.TenantUploadDir()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "mkdir failed"})
	}
	dst := filepath.Join(dir, name)
	if err := c.SaveFile(file, dst); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "save failed"})
	}
	url := "/media/" + name
	model.DB.Create(&model.Media{TenantID: tenantID, URL: url, Alt: name})
	return c.Status(201).JSON(fiber.Map{"url": url})
}
