package handler

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
	"github.com/logikraf/logikraf-v2/pkg/email"
)

const inviteTTLDays = 7

// teamMember — bentuk data yang dikirim ke UI admin (tanpa kolom sensitif).
type teamMember struct {
	ID            uint       `json:"id"`
	Name          string     `json:"name"`
	Email         string     `json:"email"`
	Scope         string     `json:"scope"`
	Status        string     `json:"status"`
	InviteExpires *time.Time `json:"invite_expires_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

func newToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func normScope(s string) string {
	if s == "" {
		return "full"
	}
	return s
}

func normStatus(s string) string {
	if s == "" {
		return "active"
	}
	return s
}

func inviteBaseURL(c fiber.Ctx) string {
	base := strings.TrimSpace(setting("company_website_url", resolveTenant(c)))
	if base == "" {
		base = "https://logikraf.id"
	}
	return strings.TrimRight(base, "/")
}

// ListTeam — daftar akun admin: pemilik, staf aktif, dan undangan tertunda.
func ListTeam(c fiber.Ctx) error {
	var rows []model.User
	if err := model.DB.Where("role = ?", "admin").Order("created_at asc").Find(&rows).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal memuat tim"})
	}
	out := make([]teamMember, 0, len(rows))
	for _, u := range rows {
		out = append(out, teamMember{ID: u.ID, Name: u.Name, Email: u.Email,
			Scope: normScope(u.Scope), Status: normStatus(u.Status),
			InviteExpires: u.InviteExpires, CreatedAt: u.CreatedAt})
	}
	return c.JSON(fiber.Map{"members": out, "total": len(out)})
}

// InviteTeamMember — buat akun staf berstatus "invited" lalu kirim tautan aktivasi.
// Akun belum bisa dipakai masuk sebelum undangannya diterima.
func InviteTeamMember(c fiber.Ctx) error {
	var in struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Scope string `json:"scope"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "data tidak valid"})
	}
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	if !strings.Contains(in.Email, "@") || len(in.Email) < 5 {
		return c.Status(400).JSON(fiber.Map{"error": "email tidak valid"})
	}
	if in.Scope != "ops" && in.Scope != "full" {
		return c.Status(400).JSON(fiber.Map{"error": "scope harus ops atau full"})
	}
	var n int64
	model.DB.Model(&model.User{}).Where("email = ?", in.Email).Count(&n)
	if n > 0 {
		return c.Status(409).JSON(fiber.Map{"error": "email ini sudah terdaftar"})
	}
	tok, err := newToken()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal membuat token"})
	}
	seed, _ := newToken()
	pw, err := auth.HashPassword(seed)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyiapkan akun"})
	}
	exp := time.Now().AddDate(0, 0, inviteTTLDays)
	uid, _ := c.Locals("user_id").(uint)
	u := model.User{Name: strings.TrimSpace(in.Name), Email: in.Email, Password: pw,
		Role: "admin", Status: "invited", Scope: in.Scope, Tenant: resolveTenant(c),
		InviteToken: &tok, InviteExpires: &exp, InvitedBy: &uid}
	if u.Name == "" {
		u.Name = in.Email
	}
	if err := model.DB.Create(&u).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan undangan"})
	}
	link := inviteBaseURL(c) + "/admin/accept-invite?token=" + tok
	sent := sendInviteEmail(u, link, in.Scope)
	log.Printf("[team] %s mengundang %s (scope %s)", actorEmail(c), u.Email, u.Scope)
	return c.JSON(fiber.Map{"id": u.ID, "email": u.Email, "scope": u.Scope, "status": u.Status,
		"invite_link": link, "expires_at": exp, "email_sent": sent})
}

// actorEmail — email pelaku aksi, dipakai untuk jejak di log.
func actorEmail(c fiber.Ctx) string {
	uid, _ := c.Locals("user_id").(uint)
	var u model.User
	if err := model.DB.Select("email").First(&u, uid).Error; err != nil {
		return "?"
	}
	return u.Email
}

func scopeLabel(s string) string {
	if s == "ops" {
		return "Operasional (tanpa Keuangan & Sistem)"
	}
	return "Penuh (Pemilik)"
}

// sendInviteEmail — kirim undangan; kegagalan email tidak membatalkan undangan
// (tautan tetap bisa disalin dari UI admin).
func sendInviteEmail(u model.User, link, scope string) bool {
	body := "<html><body style=\"font-family:Arial,sans-serif;color:#111\">" +
		"<h2>Undangan akses panel Logikraf</h2>" +
		"<p>Halo " + u.Name + ",</p>" +
		"<p>Anda diundang masuk ke panel admin Logikraf.id dengan akses <b>" + scopeLabel(scope) + "</b>.</p>" +
		"<p><a href=\"" + link + "\">Aktifkan akun &amp; buat password</a></p>" +
		"<p>Tautan berlaku " + "7" + " hari. Bila Anda tidak merasa diundang, abaikan email ini.</p>" +
		"<p>Terima kasih,<br>Logikraf</p></body></html>"
	if err := email.Send(email.DefaultConfig(), []string{u.Email}, "Undangan akses panel Logikraf.id", body); err != nil {
		log.Printf("[team] gagal kirim undangan ke %s: %v", u.Email, err)
		return false
	}
	return true
}

// ResendInvite — perbarui token + masa berlaku, lalu kirim ulang emailnya.
func ResendInvite(c fiber.Ctx) error {
	u, err := findTeamMember(c)
	if err != nil {
		return err
	}
	if normStatus(u.Status) != "invited" {
		return c.Status(400).JSON(fiber.Map{"error": "akun ini bukan undangan tertunda"})
	}
	tok, err := newToken()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal membuat token"})
	}
	exp := time.Now().AddDate(0, 0, inviteTTLDays)
	model.DB.Model(&model.User{}).Where("id = ?", u.ID).
		Updates(map[string]any{"invite_token": tok, "invite_expires": exp})
	link := inviteBaseURL(c) + "/admin/accept-invite?token=" + tok
	sent := sendInviteEmail(*u, link, normScope(u.Scope))
	log.Printf("[team] undangan %s dikirim ulang oleh %s", u.Email, actorEmail(c))
	return c.JSON(fiber.Map{"invite_link": link, "expires_at": exp, "email_sent": sent})
}

// AcceptInvite — publik: aktivasi undangan (token + password baru).
func AcceptInvite(c fiber.Ctx) error {
	var in struct {
		Token    string `json:"token"`
		Name     string `json:"name"`
		Password string `json:"password"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "data tidak valid"})
	}
	in.Token = strings.TrimSpace(in.Token)
	if len(in.Password) < 8 {
		return c.Status(400).JSON(fiber.Map{"error": "password minimal 8 karakter"})
	}
	var u model.User
	if err := model.DB.Where("invite_token = ? AND status = ?", in.Token, "invited").First(&u).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "undangan tidak ditemukan atau sudah dipakai"})
	}
	if u.InviteExpires != nil && time.Now().After(*u.InviteExpires) {
		return c.Status(410).JSON(fiber.Map{"error": "undangan sudah kedaluwarsa — minta kirim ulang"})
	}
	pw, err := auth.HashPassword(in.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan password"})
	}
	updates := map[string]any{"password": pw, "status": "active", "invite_token": nil, "invite_expires": nil}
	if n := strings.TrimSpace(in.Name); n != "" {
		updates["name"] = n
	}
	if err := model.DB.Model(&model.User{}).Where("id = ?", u.ID).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mengaktifkan akun"})
	}
	log.Printf("[team] undangan diterima: %s (scope %s)", u.Email, normScope(u.Scope))
	return c.JSON(fiber.Map{"email": u.Email, "scope": normScope(u.Scope), "status": "active"})
}

// findTeamMember — ambil anggota tim dari parameter :id (hanya role admin).
func findTeamMember(c fiber.Ctx) (*model.User, error) {
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return nil, fiber.NewError(400, "id tidak valid")
	}
	var u model.User
	if err := model.DB.Where("id = ? AND role = ?", id, "admin").First(&u).Error; err != nil {
		return nil, fiber.NewError(404, "anggota tidak ditemukan")
	}
	return &u, nil
}

// fullAdminCount — jumlah pemilik aktif; dipakai supaya akses penuh terakhir
// tidak pernah bisa dicabut atau diturunkan (mencegah terkunci dari panel sendiri).
func fullAdminCount() int64 {
	var n int64
	model.DB.Model(&model.User{}).
		Where("role = ? AND status = ? AND (scope = ? OR scope = ?)", "admin", "active", "full", "").
		Count(&n)
	return n
}

// RevokeMember — cabut akses tanpa menghapus baris (jejak audit tetap ada).
func RevokeMember(c fiber.Ctx) error {
	u, err := findTeamMember(c)
	if err != nil {
		return err
	}
	me, _ := c.Locals("user_id").(uint)
	if u.ID == me {
		return c.Status(400).JSON(fiber.Map{"error": "tidak bisa mencabut akses akun sendiri"})
	}
	if normScope(u.Scope) == "full" && normStatus(u.Status) == "active" && fullAdminCount() <= 1 {
		return c.Status(400).JSON(fiber.Map{"error": "ini pemilik aktif terakhir — aksesnya tidak boleh dicabut"})
	}
	if err := model.DB.Model(&model.User{}).Where("id = ?", u.ID).Update("status", "revoked").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mencabut akses"})
	}
	log.Printf("[team] akses %s dicabut oleh %s", u.Email, actorEmail(c))
	return c.JSON(fiber.Map{"id": u.ID, "status": "revoked"})
}

// RestoreMember — aktifkan kembali akun yang pernah dicabut.
func RestoreMember(c fiber.Ctx) error {
	u, err := findTeamMember(c)
	if err != nil {
		return err
	}
	if err := model.DB.Model(&model.User{}).Where("id = ?", u.ID).Update("status", "active").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mengaktifkan akun"})
	}
	log.Printf("[team] akses %s diaktifkan kembali oleh %s", u.Email, actorEmail(c))
	return c.JSON(fiber.Map{"id": u.ID, "status": "active"})
}

// UpdateScope — ubah tingkat akses (ops <-> full).
func UpdateScope(c fiber.Ctx) error {
	u, err := findTeamMember(c)
	if err != nil {
		return err
	}
	var in struct {
		Scope string `json:"scope"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "data tidak valid"})
	}
	if in.Scope != "ops" && in.Scope != "full" {
		return c.Status(400).JSON(fiber.Map{"error": "scope harus ops atau full"})
	}
	me, _ := c.Locals("user_id").(uint)
	if u.ID == me {
		return c.Status(400).JSON(fiber.Map{"error": "tidak bisa mengubah akses akun sendiri"})
	}
	if in.Scope == "ops" && normScope(u.Scope) == "full" && normStatus(u.Status) == "active" && fullAdminCount() <= 1 {
		return c.Status(400).JSON(fiber.Map{"error": "ini pemilik aktif terakhir — aksesnya tidak boleh diturunkan"})
	}
	if err := model.DB.Model(&model.User{}).Where("id = ?", u.ID).Update("scope", in.Scope).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal mengubah akses"})
	}
	log.Printf("[team] scope %s -> %s oleh %s", u.Email, in.Scope, actorEmail(c))
	return c.JSON(fiber.Map{"id": u.ID, "scope": in.Scope})
}
