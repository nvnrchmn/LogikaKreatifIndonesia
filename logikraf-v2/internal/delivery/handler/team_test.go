package handler

import (
	"encoding/json"
	"io"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
)

// teamTestApp — app kecil berisi rute tim + dua rute admin tiruan untuk menguji
// gerbang scope: /api/settings (khusus pemilik) dan /api/orders (boleh ops).
func teamTestApp() *fiber.App {
	a := fiber.New()
	a.Post("/api/auth/login", auth.Login)
	a.Post("/api/auth/accept-invite", AcceptInvite)
	admin := a.Group("/api", auth.AuthMiddleware(), auth.AdminOnly(), auth.ScopeGuard())
	admin.Get("/team", ListTeam)
	admin.Post("/team/invite", InviteTeamMember)
	admin.Post("/team/:id/resend", ResendInvite)
	admin.Post("/team/:id/revoke", RevokeMember)
	admin.Post("/team/:id/restore", RestoreMember)
	admin.Patch("/team/:id", UpdateScope)
	admin.Get("/settings", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })
	admin.Get("/orders", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })
	return a
}

func callJSON(t *testing.T, a *fiber.App, method, path, token, body string) (int, string) {
	t.Helper()
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, path, r)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := a.Test(req)
	if err != nil {
		t.Fatalf("%s %s: %v", method, path, err)
	}
	b, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, string(b)
}

func makeUser(t *testing.T, email, scope, status, password string) uint {
	t.Helper()
	pw, err := auth.HashPassword(password)
	if err != nil {
		t.Fatal(err)
	}
	u := model.User{Name: email, Email: email, Password: pw, Role: "admin", Scope: scope, Status: status, Tenant: "logikraf"}
	if err := model.DB.Create(&u).Error; err != nil {
		t.Fatal(err)
	}
	return u.ID
}

func token(t *testing.T, id uint) string {
	t.Helper()
	tk, err := auth.GenerateToken(id, "admin", "logikraf")
	if err != nil {
		t.Fatal(err)
	}
	return tk
}

// withTeamDB — test ini memakai DB-nya sendiri supaya tidak bergantung pada urutan
// eksekusi suite (ada test lain di paket ini yang mengganti model.DB sementara).
func withTeamDB(t *testing.T) {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file:team_test?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("buka db uji: %v", err)
	}
	if sqlDB, err := db.DB(); err == nil {
		sqlDB.SetMaxOpenConns(1)
	}
	if err := db.AutoMigrate(&model.User{}, &model.Setting{}); err != nil {
		t.Fatalf("migrasi db uji: %v", err)
	}
	orig := model.DB
	model.DB = db
	t.Cleanup(func() { model.DB = orig })
}

func itoa(i uint) string { return strconv.FormatUint(uint64(i), 10) }

// TestTeamInviteFlow — undang → belum bisa login → aktivasi → bisa login, dan
// token undangan hanya berlaku sekali.
func TestTeamInviteFlow(t *testing.T) {
	withTeamDB(t)
	a := teamTestApp()
	owner := makeUser(t, "owner@test.id", "full", "active", "ownerpass123")

	code, body := callJSON(t, a, "POST", "/api/team/invite", token(t, owner),
		`{"name":"Staf Satu","email":"staf@test.id","scope":"ops"}`)
	if code != 200 {
		t.Fatalf("invite: %d %s", code, body)
	}
	var inv struct {
		ID         uint   `json:"id"`
		InviteLink string `json:"invite_link"`
		Scope      string `json:"scope"`
	}
	if err := json.Unmarshal([]byte(body), &inv); err != nil {
		t.Fatal(err)
	}
	if inv.Scope != "ops" || !strings.Contains(inv.InviteLink, "token=") {
		t.Fatalf("undangan tidak sesuai: %s", body)
	}
	tok := inv.InviteLink[strings.Index(inv.InviteLink, "token=")+6:]

	// Password akun undangan diisi acak, jadi login ditolak sebagai kredensial salah (401).
	// Yang penting: akun undangan TIDAK bisa masuk sebelum diaktifkan.
	if code, _ := callJSON(t, a, "POST", "/api/auth/login", "", `{"email":"staf@test.id","password":"rahasia123"}`); code == 200 {
		t.Fatal("akun undangan bisa login sebelum diaktifkan")
	}
	if code, b := callJSON(t, a, "POST", "/api/auth/accept-invite", "", `{"token":"`+tok+`","name":"Staf Satu","password":"rahasia123"}`); code != 200 {
		t.Fatalf("accept-invite: %d %s", code, b)
	}
	if code, b := callJSON(t, a, "POST", "/api/auth/login", "", `{"email":"staf@test.id","password":"rahasia123"}`); code != 200 {
		t.Fatalf("login setelah aktivasi: %d %s", code, b)
	}
	if code, _ := callJSON(t, a, "POST", "/api/auth/accept-invite", "", `{"token":"`+tok+`","password":"rahasia123"}`); code == 200 {
		t.Fatal("token undangan bisa dipakai dua kali")
	}
}

// TestTeamScopeAndRevoke — scope ops tidak boleh menyentuh modul uang/sistem, dan
// pencabutan akses berlaku seketika walau token JWT-nya masih valid.
func TestTeamScopeAndRevoke(t *testing.T) {
	withTeamDB(t)
	a := teamTestApp()
	owner := makeUser(t, "owner2@test.id", "full", "active", "ownerpass123")
	staff := makeUser(t, "staf2@test.id", "ops", "active", "staffpass123")
	st := token(t, staff)

	if code, _ := callJSON(t, a, "GET", "/api/settings", st, ""); code != 403 {
		t.Fatalf("ops mengakses /api/settings: %d, mau 403", code)
	}
	if code, _ := callJSON(t, a, "GET", "/api/orders", st, ""); code != 200 {
		t.Fatalf("ops mengakses /api/orders: %d, mau 200", code)
	}
	if code, _ := callJSON(t, a, "GET", "/api/team", st, ""); code != 403 {
		t.Fatalf("ops mengakses /api/team: %d, mau 403", code)
	}
	if code, b := callJSON(t, a, "POST", "/api/team/"+itoa(staff)+"/revoke", token(t, owner), ""); code != 200 {
		t.Fatalf("revoke: %d %s", code, b)
	}
	if code, _ := callJSON(t, a, "GET", "/api/orders", st, ""); code != 403 {
		t.Fatalf("token staf masih bisa dipakai setelah dicabut: %d", code)
	}
	// Password benar + status dicabut harus ditolak di gerbang login.
	if code, b := callJSON(t, a, "POST", "/api/auth/login", "", `{"email":"staf2@test.id","password":"staffpass123"}`); code != 403 {
		t.Fatalf("login akun dicabut: %d %s, mau 403", code, b)
	}
	if code, b := callJSON(t, a, "POST", "/api/team/"+itoa(owner)+"/revoke", token(t, owner), ""); code != 400 {
		t.Fatalf("revoke diri sendiri: %d %s", code, b)
	}
	if code, b := callJSON(t, a, "POST", "/api/team/"+itoa(staff)+"/restore", token(t, owner), ""); code != 200 {
		t.Fatalf("restore: %d %s", code, b)
	}
	if code, _ := callJSON(t, a, "GET", "/api/orders", st, ""); code != 200 {
		t.Fatalf("akses tidak pulih setelah restore: %d", code)
	}
}

// TestRevokedTokenBlockedOutsideAdminGroup — celah yang ditemukan saat uji produksi:
// rute yang hanya memakai AuthMiddleware (mis. /api/orders) sempat masih menerima token
// akun yang sudah dicabut. Status akun kini diperiksa di AuthMiddleware, jadi berlaku
// untuk semua rute terautentikasi.
func TestRevokedTokenBlockedOutsideAdminGroup(t *testing.T) {
	withTeamDB(t)
	a := fiber.New()
	a.Get("/api/orders", auth.AuthMiddleware(), func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })
	staff := makeUser(t, "staf3@test.id", "ops", "active", "staffpass123")
	tk := token(t, staff)
	if code, b := callJSON(t, a, "GET", "/api/orders", tk, ""); code != 200 {
		t.Fatalf("sebelum dicabut: %d %s", code, b)
	}
	model.DB.Model(&model.User{}).Where("id = ?", staff).Update("status", "revoked")
	if code, _ := callJSON(t, a, "GET", "/api/orders", tk, ""); code != 403 {
		t.Fatalf("setelah dicabut: %d, mau 403", code)
	}
}
