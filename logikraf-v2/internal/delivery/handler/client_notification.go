package handler

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// SaveClientNotification menyimpan notifikasi untuk lonceng di portal klien.
// Dipanggil dari alur yang sudah mengirim email/WA; gagal simpan tidak boleh
// mengganggu alur utama, jadi galatnya diabaikan.
func SaveClientNotification(clientID uint, title, body, link string) {
	if clientID == 0 {
		return
	}
	_ = model.DB.Create(&model.ClientNotification{
		ClientID: clientID,
		Title:    strings.TrimSpace(title),
		Body:     strings.TrimSpace(body),
		Link:     strings.TrimSpace(link),
	}).Error
}

// ClientNotifications — daftar notifikasi portal klien + jumlah belum dibaca.
func ClientNotifications(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil || cid == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}
	var rows []model.ClientNotification
	if err := model.DB.Where("client_id = ?", cid).Order("id DESC").Limit(50).Find(&rows).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	var unread int64
	model.DB.Model(&model.ClientNotification{}).
		Where("client_id = ? AND read_at IS NULL", cid).Count(&unread)
	return c.JSON(fiber.Map{"notifications": rows, "unread": unread})
}

// ReadClientNotification — tandai satu notifikasi sudah dibaca.
func ReadClientNotification(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil || cid == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}
	res := model.DB.Model(&model.ClientNotification{}).
		Where("id = ? AND client_id = ? AND read_at IS NULL", c.Params("id"), cid).
		Update("read_at", time.Now())
	if res.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"ok": true, "updated": res.RowsAffected})
}

// ReadAllClientNotifications — tandai semua notifikasi sudah dibaca.
func ReadAllClientNotifications(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil || cid == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}
	res := model.DB.Model(&model.ClientNotification{}).
		Where("client_id = ? AND read_at IS NULL", cid).
		Update("read_at", time.Now())
	if res.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"ok": true, "updated": res.RowsAffected})
}
