package invoices

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

type CreateInvoiceReq struct {
	OrderID    string          `json:"order_id"`
	IssueDate  string          `json:"issue_date"`
	DueDate    string          `json:"due_date"`
	Items      []InvoiceItemReq `json:"items"`
}

type InvoiceItemReq struct {
	Name  string `json:"name"`
	Qty   int    `json:"qty"`
	Price int    `json:"price"`
}

// POST /api/invoices
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateInvoiceReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var order models.Order
	h.db.First(&order, "id = ?", req.OrderID)

	total := 0
	var items []models.InvoiceItem
	for _, i := range req.Items {
		items = append(items, models.InvoiceItem{
			Name:  i.Name,
			Qty:   i.Qty,
			Price: i.Price,
			Total: i.Qty * i.Price,
		})
		total += i.Qty * i.Price
	}

	invNo := "INV-" + req.OrderID
	inv := models.Invoice{
		OrderID:     req.OrderID,
		BusinessID:  order.BusinessID,
		InvoiceNo:   invNo,
		IssueDate:   req.IssueDate,
		DueDate:     req.DueDate,
		TotalAmount: float64(total),
		Status:      "draft",
	}
	h.db.Create(&inv)
	for i := range items {
		items[i].InvoiceID = inv.ID
	}
	h.db.Create(&items)
	return c.Status(201).JSON(inv)
}

// GET /api/invoices
func (h *Handler) List(c *fiber.Ctx) error {
	var invoices []models.Invoice
	h.db.Unscoped().Preload("Items").Find(&invoices)
	return c.JSON(invoices)
}

// GET /api/invoices/:id
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	var inv models.Invoice
	if err := h.db.Preload("Items").First(&inv, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "invoice not found"})
	}
	return c.JSON(inv)
}