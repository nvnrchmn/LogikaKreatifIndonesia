package businesses

import (
	"reflect"
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

type CreateBusinessReq struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Logo        string `json:"logo"`
	CoverImage  string `json:"cover_image"`
	Description string `json:"description"`
	Address     string `json:"address"`
	GoogleMaps  string `json:"google_maps"`
	Category    string `json:"category"`
	Status      string `json:"status"`
}

// POST /api/businesses
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateBusinessReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	b := models.Business{
		Name:        req.Name,
		Slug:        req.Slug,
		Logo:        req.Logo,
		CoverImage:  req.CoverImage,
		Description: req.Description,
		Address:     req.Address,
		GoogleMaps:  req.GoogleMaps,
		Category:    req.Category,
		Status:      req.Status,
	}
	if err := h.db.Create(&b).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(b)
}

// GET /api/businesses
func (h *Handler) List(c *fiber.Ctx) error {
	var businesses []models.Business
	var result []models.Business
	h.db.Unscoped().Find(&businesses)
	result = businesses
	return c.JSON(result)
}

// GET /api/businesses/:id
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	var b models.Business
	if err := h.db.First(&b, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "business not found"})
	}
	return c.JSON(b)
}

// PUT /api/businesses/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req CreateBusinessReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var b models.Business
	if err := h.db.First(&b, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "business not found"})
	}
	// update fields only if provided
	if !reflect.DeepEqual(req, CreateBusinessReq{}) {
		b.Name = req.Name
		b.Slug = req.Slug
		b.Logo = req.Logo
		b.CoverImage = req.CoverImage
		b.Description = req.Description
		b.Address = req.Address
		b.GoogleMaps = req.GoogleMaps
		b.Category = req.Category
		b.Status = req.Status
	}
	if err := h.db.Save(&b).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(b)
}

// DELETE /api/businesses/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.db.Delete(&models.Business{}, "id = ?", id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}