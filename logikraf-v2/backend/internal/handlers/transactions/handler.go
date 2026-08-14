package transactions

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

type RefundReq struct {
	Amount float64 `json:"amount"`
	Reason string  `json:"reason"`
}

// GET /api/transactions
func (h *Handler) List(c *fiber.Ctx) error {
	var txns []models.Transaction
	h.db.Unscoped().Preload("Refunds").Find(&txns)
	return c.JSON(txns)
}

// GET /api/transactions/:id
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	var t models.Transaction
	if err := h.db.Preload("Refunds").First(&t, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "transaction not found"})
	}
	return c.JSON(t)
}

// PUT /api/transactions/:id/status
func (h *Handler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct{ Status string `json:"status"` }
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var t models.Transaction
	if err := h.db.First(&t, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "transaction not found"})
	}
	t.Status = req.Status
	if err := h.db.Save(&t).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(t)
}

// POST /api/transactions/:id/refund
func (h *Handler) Refund(c *fiber.Ctx) error {
	id := c.Params("id")
	var req RefundReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var t models.Transaction
	if err := h.db.First(&t, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "transaction not found"})
	}
	refund := models.TransactionRefund{
		TransactionID: id,
		Amount:        req.Amount,
		Reason:        req.Reason,
	}
	t.RefundAmount += req.Amount
	t.Status = "refunded"
	h.db.Create(&refund)
	h.db.Save(&t)
	return c.JSON(t)
}