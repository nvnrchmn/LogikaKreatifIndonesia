package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"github.com/logikraf/logikraf-v2/pkg/wa"
)

func hashToken(t string) string {
	s := sha256.Sum256([]byte(t))
	return hex.EncodeToString(s[:])
}

// portalBaseURL — basis URL portal klien (settings company_client_portal_url).
func portalBaseURL() string {
	var s model.Setting
	if err := model.DB.Where("tenant = ? AND `key` = ?", "logikraf", "company_client_portal_url").First(&s).Error; err == nil {
		if v := strings.TrimSpace(s.Value); v != "" {
			return strings.TrimRight(v, "/")
		}
	}
	return "https://logikraf.id/client"
}

// ForgotPassword — kirim tautan reset ke email terdaftar. Selalu balas 200
// supaya tidak membocorkan email mana yang terdaftar.
func ForgotPassword(c fiber.Ctx) error {
	var in struct {
		Email string `json:"email"`
	}
	_ = c.Bind().JSON(&in)
	mail := strings.ToLower(strings.TrimSpace(in.Email))
	if mail == "" {
		return c.Status(400).JSON(fiber.Map{"error": "email wajib diisi"})
	}
	var user model.User
	if err := model.DB.Where("email = ?", mail).First(&user).Error; err == nil {
		buf := make([]byte, 32)
		if _, err := rand.Read(buf); err == nil {
			token := hex.EncodeToString(buf)
			model.DB.Create(&model.PasswordReset{
				Email:     mail,
				TokenHash: hashToken(token),
				ExpiresAt: time.Now().Add(time.Hour),
			})
			link := portalBaseURL() + "/reset-password?token=" + token
			if cfg := email.DefaultConfig(); cfg.Host != "" {
				body := "<p>Halo " + user.Name + ",</p>" +
					"<p>Kami menerima permintaan reset kata sandi untuk akun portal Logikraf Anda.</p>" +
					"<p><a href=\"" + link + "\">Buat kata sandi baru</a></p>" +
					"<p>Tautan berlaku 1 jam dan hanya bisa dipakai sekali. Abaikan email ini bila Anda tidak meminta reset.</p>"
				go func() { _ = email.Send(cfg, []string{mail}, "Reset kata sandi portal Logikraf", body) }()
			}
			if num := clientWhatsApp(mail); num != "" {
				go func() {
					_ = wa.New().Send(num, "Reset kata sandi portal Logikraf\nTautan (berlaku 1 jam):\n"+link)
				}()
			}
		}
	}
	return c.JSON(fiber.Map{"ok": true, "message": "Jika email terdaftar, tautan reset sudah dikirim."})
}

func clientWhatsApp(mail string) string {
	var cl model.Client
	if err := model.DB.Where("email = ?", mail).First(&cl).Error; err == nil {
		return cl.Phone
	}
	return ""
}

// ResetPassword — setel kata sandi baru memakai token yang valid & belum dipakai.
func ResetPassword(c fiber.Ctx) error {
	var in struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if len(strings.TrimSpace(in.Password)) < 8 {
		return c.Status(400).JSON(fiber.Map{"error": "kata sandi minimal 8 karakter"})
	}
	var pr model.PasswordReset
	if err := model.DB.Where("token_hash = ? AND used_at IS NULL AND expires_at > ?",
		hashToken(strings.TrimSpace(in.Token)), time.Now()).First(&pr).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "tautan reset tidak valid atau sudah kedaluwarsa"})
	}
	var user model.User
	if err := model.DB.Where("email = ?", pr.Email).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "akun tidak ditemukan"})
	}
	h, err := HashPassword(in.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	if err := model.DB.Model(&user).Update("password", h).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	now := time.Now()
	model.DB.Model(&model.PasswordReset{}).Where("email = ?", pr.Email).Update("used_at", now)
	return c.JSON(fiber.Map{"ok": true})
}
