package handler

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// RefreshXenplatformAdmin — GET /api/client-stores/:id/xenplatform
// Tarik data sub-account LANGSUNG dari Xendit, simpan status akun + waktu sinkron ke DB.
// Dipakai tombol "Refresh Data Xendit"; field XenPlatform bersifat read-only di UI.
func RefreshXenplatformAdmin(c fiber.Ctx) error {
	var store model.ClientStore
	if err := model.DB.First(&store, c.Params("id")).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "mitra tidak ditemukan")
	}
	if strings.TrimSpace(store.SubAccountID) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "mitra belum terhubung ke sub-account Xendit")
	}
	acc, code, msg, err := fetchXenAccount(store.SubAccountID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "gagal menghubungi Xendit")
	}
	if code != 200 {
		return c.Status(code).JSON(fiber.Map{"error": "Xendit: " + msg})
	}
	now := time.Now()
	model.DB.Model(&store).Updates(map[string]any{
		"xendit_account_status": acc.Status,
		"xendit_synced_at":      now,
	})
	return c.JSON(fiber.Map{
		"sub_account_id": acc.ID,
		"account_status": acc.Status,
		"business_name":  acc.BusinessName,
		"email":          acc.Email,
		"country":        acc.Country,
		"xendit_created": acc.Created,
		"xendit_updated": acc.Updated,
		"synced_at":      now.Format(time.RFC3339),
	})
}
