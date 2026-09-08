package handler

import (
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func storeKeyPreview(k string) string {
	if len(k) <= 8 {
		return k
	}
	return k[:8] + "…"
}

// ---- Admin CRUD client stores (UI management) ----

// ListClientStoresAdmin: GET /api/client-store-settlements/stores
func ListClientStoresAdmin(c fiber.Ctx) error {
	var stores []model.ClientStore
	if err := model.DB.Order("name ASC").Find(&stores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	type row struct {
		ID         uint      `json:"id"`
		Slug       string    `json:"slug"`
		Name       string    `json:"name"`
		BaseURL    string    `json:"base_url"`
		FeePct     float64   `json:"fee_pct"`
		IsActive   bool      `json:"is_active"`
		KeyPreview string    `json:"key_preview"`
		CreatedAt  time.Time `json:"created_at"`
	}
	rows := make([]row, 0, len(stores))
	for _, s := range stores {
		rows = append(rows, row{ID: s.ID, Slug: s.Slug, Name: s.Name, BaseURL: s.BaseURL,
			FeePct: s.FeePct, IsActive: s.IsActive, KeyPreview: storeKeyPreview(s.InternalKey), CreatedAt: s.CreatedAt})
	}
	return c.JSON(fiber.Map{"stores": rows})
}

type storeInput struct {
	Slug    string  `json:"slug"`
	Name    string  `json:"name"`
	BaseURL string  `json:"base_url"`
	FeePct  float64 `json:"fee_pct"` // Logikraf Fee % — 0 = otomatis dari Xendit
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else if r == ' ' || r == '-' || r == '_' {
			b.WriteByte('-')
		}
	}
	return strings.Trim(b.String(), "-")
}

// CreateClientStoreAdmin: POST /api/client-store-settlements/stores
// Returns the generated key ONCE so Logikraf can install it on the store app.
func CreateClientStoreAdmin(c fiber.Ctx) error {
	var in storeInput
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "payload tidak valid"})
	}
	in.Name = strings.TrimSpace(in.Name)
	in.BaseURL = strings.TrimSpace(strings.TrimSuffix(in.BaseURL, "/"))
	if in.Name == "" || in.BaseURL == "" {
		return c.Status(400).JSON(fiber.Map{"error": "nama & base_url wajib diisi"})
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Name)
	}
	in.Slug = slugify(in.Slug)
	if in.Slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "slug tidak valid"})
	}
	store := model.ClientStore{
		Slug: in.Slug, Name: in.Name, BaseURL: in.BaseURL, FeePct: in.FeePct,
		InternalKey: model.GenerateInternalKey(), IsActive: true,
	}
	if err := model.DB.Create(&store).Error; err != nil {
		return c.Status(409).JSON(fiber.Map{"error": "gagal membuat (slug mungkin sudah dipakai): " + err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{
		"store":        store,
		"internal_key": store.InternalKey, // hanya dikembalikan sekali ini
	})
}

// GetClientStoreKeyAdmin: GET /api/client-store-settlements/stores/:id/key
func GetClientStoreKeyAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var s model.ClientStore
	if err := model.DB.First(&s, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client store tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"store_id": s.ID, "slug": s.Slug, "internal_key": s.InternalKey})
}

// UpdateClientStoreAdmin: PUT /api/client-store-settlements/stores/:id
func UpdateClientStoreAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var in struct {
		Name     string   `json:"name"`
		BaseURL  string   `json:"base_url"`
		FeePct   *float64 `json:"fee_pct"`
		IsActive *bool    `json:"is_active"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "payload tidak valid"})
	}
	if in.FeePct != nil && (*in.FeePct < 0 || *in.FeePct > 100) {
		return c.Status(400).JSON(fiber.Map{"error": "fee_pct harus 0–100"})
	}
	updates := map[string]interface{}{}
	if in.Name != "" {
		updates["name"] = strings.TrimSpace(in.Name)
	}
	if in.BaseURL != "" {
		updates["base_url"] = strings.TrimSpace(strings.TrimSuffix(in.BaseURL, "/"))
	}
	if in.FeePct != nil {
		updates["fee_pct"] = *in.FeePct
	}
	if in.IsActive != nil {
		updates["is_active"] = *in.IsActive
	}
	if len(updates) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "tidak ada perubahan"})
	}
	if err := model.DB.Model(&model.ClientStore{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "client store diperbarui"})
}

// RegenerateClientStoreKeyAdmin: POST /api/client-store-settlements/stores/:id/regenerate
func RegenerateClientStoreKeyAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var s model.ClientStore
	if err := model.DB.First(&s, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client store tidak ditemukan"})
	}
	s.InternalKey = model.GenerateInternalKey()
	if err := model.DB.Model(&s).Update("internal_key", s.InternalKey).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"store_id": s.ID, "slug": s.Slug, "internal_key": s.InternalKey}) // sekali ini
}

// DeleteClientStoreAdmin: DELETE /api/client-store-settlements/stores/:id
func DeleteClientStoreAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := model.DB.Delete(&model.ClientStore{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "client store dihapus"})
}

// ---- Internal fetch helpers ----
