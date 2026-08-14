package settings

import (
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/backend/internal/models"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func New(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

// GET /api/settings
func (h *Handler) GetAll(c *fiber.Ctx) error {
	var settings []models.Setting
	if err := h.db.Find(&settings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(settings)
}

// GET /api/settings/:key
func (h *Handler) GetByKey(c *fiber.Ctx) error {
	key := c.Params("key")
	var s models.Setting
	if err := h.db.First(&s, "key = ?", key).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "setting not found"})
	}
	return c.JSON(s)
}

// PUT /api/settings/:key
func (h *Handler) Update(c *fiber.Ctx) error {
	key := c.Params("key")
	var s models.Setting
	if err := h.db.First(&s, "key = ?", key).Error; err != nil {
		s.Key = key
	}
	type updateReq struct {
		Value string `json:"value"`
	}
	var req updateReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	s.Key = key
	s.Value = req.Value
	if err := h.db.Save(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(s)
}