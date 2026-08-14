package services

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

type CreateServiceReq struct {
	Name             string           `json:"name"`
	Slug             string           `json:"slug"`
	Icon             string           `json:"icon"`
	CoverImage       string           `json:"cover_image"`
	ShortDescription string           `json:"short_description"`
	Description      string           `json:"description"`
	IsPublished      bool             `json:"is_published"`
	Features         []FeatureRequest `json:"features,omitempty"`
}

type FeatureRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	OrderNo     int    `json:"order_no"`
}

type UpdateServiceReq struct {
	Name             string           `json:"name"`
	Slug             string           `json:"slug"`
	Icon             string           `json:"icon"`
	CoverImage       string           `json:"cover_image"`
	ShortDescription string           `json:"short_description"`
	Description      string           `json:"description"`
	IsPublished      bool             `json:"is_published"`
	Features         []FeatureRequest `json:"features,omitempty"`
}

// POST /api/services
func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateServiceReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	s := models.Service{
		Name:             req.Name,
		Slug:             req.Slug,
		Icon:             req.Icon,
		CoverImage:       req.CoverImage,
		ShortDescription: req.ShortDescription,
		Description:      req.Description,
		IsPublished:      req.IsPublished,
	}
	if err := h.db.Create(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// create features
	for i, f := range req.Features {
		feature := models.ServiceFeature{
			ServiceID:   s.ID,
			Title:       f.Title,
			Description: f.Description,
			Icon:        f.Icon,
			OrderNo:     f.OrderNo,
		}
		h.db.Create(&feature)
		i++
	}
	return c.Status(201).JSON(s)
}

// GET /api/services
func (h *Handler) List(c *fiber.Ctx) error {
	var services []models.Service
	h.db.Unscoped().Find(&services)
	return c.JSON(services)
}

// GET /api/services/:id
func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	var s models.Service
	if err := h.db.Preload("Features").First(&s, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}
	return c.JSON(s)
}

// PUT /api/services/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateServiceReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var s models.Service
	if err := h.db.First(&s, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "service not found"})
	}
	if !reflect.DeepEqual(req, UpdateServiceReq{}) {
		s.Name = req.Name
		s.Slug = req.Slug
		s.Icon = req.Icon
		s.CoverImage = req.CoverImage
		s.ShortDescription = req.ShortDescription
		s.Description = req.Description
		s.IsPublished = req.IsPublished
	}
	if err := h.db.Save(&s).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(s)
}

// DELETE /api/services/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	h.db.Delete(&models.ServiceFeature{}, "service_id = ?", id)
	if err := h.db.Delete(&models.Service{}, "id = ?", id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "deleted"})
}