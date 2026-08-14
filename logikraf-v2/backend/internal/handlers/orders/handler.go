package orders

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

type CreateOrderReq struct {
	BusinessID     string         `json:"business_id"`
	ServiceID      string         `json:"service_id"`
	ClientName     string         `json:"client_name"`
	ClientEmail    string         `json:"client_email"`
	ClientPhone    string         `json:"client_phone"`
	QuoteAmount    float64        `json:"quote_amount"`
	FinalAmount    float64        `json:"final_amount"`
	PaymentGateway string          `json:"payment_gateway"`
	Notes          string         `json:"notes"`
}

// POST /api/orders
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateOrderReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	o := models.Order{
		BusinessID:     req.BusinessID,
		ServiceID:      req.ServiceID,
		ClientName:     req.ClientName,
		ClientEmail:    req.ClientEmail,
		ClientPhone:    req.ClientPhone,
		QuoteAmount:    req.QuoteAmount,
		FinalAmount:    req.FinalAmount,
		PaymentGateway: req.PaymentGateway,
		Status:         "draft",
		Notes:          req.Notes,
	}
	if err := h.db.Create(&o).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(o)
}

// GET /api/orders
func (h *Handler) List(c *fiber.Ctx) error {
	var orders []models.Order
	h.db.Unscoped().Preload("Items").Find(&orders)
	return c.JSON(orders)
}

// GET /api/orders/:id
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	var o models.Order
	if err := h.db.First(&o, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "order not found"})
	}
	return c.JSON(o)
}

// PUT /api/orders/:id
func (h *Handler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct{ Status string `json:"status"` }
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var o models.Order
	if err := h.db.First(&o, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "order not found"})
	}
	o.Status = req.Status
	if err := h.db.Save(&o).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(o)
}

// DELETE /api/orders/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.db.Delete(&models.Order{}, "id = ?", id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}