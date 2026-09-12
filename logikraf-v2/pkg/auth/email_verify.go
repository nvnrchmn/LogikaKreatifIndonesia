package auth

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
)

// SendEmailVerification — buat token verifikasi email lalu kirim tautannya.
// Dipanggil saat klien mendaftar dan saat "kirim ulang". Sengaja tidak
// mengembalikan galat ke pemanggil: kegagalan kirim email tidak boleh
// menggagalkan pendaftaran.
func SendEmailVerification(user model.User) {
	if user.Email == "" {
		return
	}
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return
	}
	token := hex.EncodeToString(buf)
	now := time.Now()
	// Tautan lama dimatikan supaya hanya tautan terbaru yang berlaku.
	model.DB.Model(&model.EmailVerification{}).
		Where("email = ? AND used_at IS NULL", user.Email).
		Update("used_at", now)
	model.DB.Create(&model.EmailVerification{
		Email:     user.Email,
		TokenHash: hashToken(token),
		ExpiresAt: now.Add(24 * time.Hour),
	})
	link := portalBaseURL() + "/verify-email?token=" + token
	name := user.Name
	if name == "" {
		name = "Bapak/Ibu"
	}
	if cfg := email.DefaultConfig(); cfg.Host != "" {
		body := "<p>Halo " + name + ",</p>" +
			"<p>Terima kasih sudah mendaftar di portal Logikraf. Mohon pastikan alamat email ini benar dengan menekan tautan berikut:</p>" +
			"<p><a href=\"" + link + "\">Verifikasi email saya</a></p>" +
			"<p>Tautan berlaku 24 jam dan hanya bisa dipakai sekali.</p>" +
			"<p>Salam,<br>Tim Logikraf</p>"
		go func() { _ = email.Send(cfg, []string{user.Email}, "Verifikasi email portal Logikraf", body) }()
	}
}

// VerifyEmail — tandai email pengguna terverifikasi. Token sekali pakai,
// berlaku 24 jam, dan hanya hash SHA-256-nya yang tersimpan.
func VerifyEmail(c fiber.Ctx) error {
	var in struct {
		Token string `json:"token"`
	}
	_ = c.Bind().JSON(&in)
	tok := strings.TrimSpace(in.Token)
	if tok == "" {
		return c.Status(400).JSON(fiber.Map{"error": "token wajib diisi"})
	}
	var rec model.EmailVerification
	if err := model.DB.Where("token_hash = ?", hashToken(tok)).First(&rec).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "tautan verifikasi tidak valid"})
	}
	if rec.UsedAt != nil {
		return c.Status(400).JSON(fiber.Map{"error": "tautan verifikasi sudah dipakai"})
	}
	if time.Now().After(rec.ExpiresAt) {
		return c.Status(400).JSON(fiber.Map{"error": "tautan verifikasi sudah kedaluwarsa"})
	}
	now := time.Now()
	if err := model.DB.Model(&model.EmailVerification{}).Where("id = ?", rec.ID).Update("used_at", now).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memproses"})
	}
	model.DB.Model(&model.User{}).Where("email = ?", rec.Email).Update("email_verified_at", now)
	return c.JSON(fiber.Map{"message": "email terverifikasi", "email": rec.Email})
}

// ResendVerification — kirim ulang tautan verifikasi. Dipanggil dari portal
// yang butuh sesi login, jadi tidak bisa dipakai untuk menyemprot email.
func ResendVerification(c fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(uint)
	if uid == 0 {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	var user model.User
	if err := model.DB.First(&user, uid).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "pengguna tidak ditemukan"})
	}
	if user.EmailVerifiedAt != nil {
		return c.JSON(fiber.Map{"message": "email sudah terverifikasi"})
	}
	SendEmailVerification(user)
	return c.JSON(fiber.Map{"message": "tautan verifikasi dikirim ulang"})
}
