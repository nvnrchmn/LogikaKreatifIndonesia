package handler

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
)

// ClientProfile — profil klien yang login (gabungan User + Client).
func ClientProfile(c fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(uint)
	var u model.User
	if err := model.DB.First(&u, uid).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	out := fiber.Map{"name": u.Name, "email": u.Email}
	if _, cl, err := clientIDForUser(c); err == nil {
		out["company"] = cl.CompanyName
		out["phone"] = cl.Phone
		out["address"] = cl.Address
		out["invite_code"] = cl.InviteCode
	}
	return c.JSON(out)
}

// UpdateClientProfile — simpan perubahan profil klien (name, company, phone, alamat).
func UpdateClientProfile(c fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(uint)
	var in struct {
		Name    string `json:"name"`
		Company string `json:"company"`
		Phone   string `json:"phone"`
		Address string `json:"address"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var u model.User
	if err := model.DB.First(&u, uid).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	if n := strings.TrimSpace(in.Name); n != "" && n != u.Name {
		model.DB.Model(&u).Update("name", n)
	}
	if _, cl, err := clientIDForUser(c); err == nil {
		up := map[string]any{}
		if v := strings.TrimSpace(in.Company); v != "" {
			up["company_name"] = v
		}
		if v := strings.TrimSpace(in.Phone); v != "" {
			up["phone"] = v
		}
		if v := strings.TrimSpace(in.Address); v != "" {
			up["address"] = v
		}
		if len(up) > 0 {
			model.DB.Model(&model.Client{}).Where("id = ?", cl.ID).Updates(up)
		}
	}
	return c.JSON(fiber.Map{"ok": true})
}

// ChangeClientPassword — ganti kata sandi klien (wajib verifikasi sandi lama).
func ChangeClientPassword(c fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(uint)
	var in struct {
		Current string `json:"current_password"`
		New     string `json:"new_password"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if len(in.New) < 8 {
		return c.Status(400).JSON(fiber.Map{"error": "kata sandi baru minimal 8 karakter"})
	}
	var u model.User
	if err := model.DB.First(&u, uid).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	if !auth.CheckPassword(in.Current, u.Password) {
		return c.Status(400).JSON(fiber.Map{"error": "kata sandi saat ini salah"})
	}
	h, err := auth.HashPassword(in.New)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := model.DB.Model(&u).Update("password", h).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"ok": true})
}
