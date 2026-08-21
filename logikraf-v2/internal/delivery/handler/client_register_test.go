package handler

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"gorm.io/gorm"
)

func setupRegisterApp(db *gorm.DB) *fiber.App {
	model.DB = db
	app := fiber.New()
	app.Post("/client/register", RegisterClient)
	return app
}

func TestRegisterClientSafety(t *testing.T) {
	origDB := model.DB
	t.Cleanup(func() { model.DB = origDB })
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&model.Client{}, &model.User{}); err != nil {
		t.Fatal(err)
	}
	app := setupRegisterApp(db)

	// Seed a client with invite code
	code1 := "ABC123"
	client := model.Client{CompanyName: "PT ABC", PICName: "Budi", InviteCode: &code1}
	if err := db.Create(&client).Error; err != nil {
		t.Fatal(err)
	}
	// Second client with another invite code (regression: two successful
	// registrations must both work; consuming codes to '' would collide on the
	// unique index).
	code2 := "DEF456"
	client2 := model.Client{CompanyName: "PT DEF", PICName: "Cici", InviteCode: &code2}
	if err := db.Create(&client2).Error; err != nil {
		t.Fatal(err)
	}

	do := func(body string) int {
		req := httptest.NewRequest("POST", "/client/register", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		return resp.StatusCode
	}

	// Missing fields
	if code := do(`{"name":"Budi","email":"budi@x.id","password":"secret12"}`); code != 400 {
		t.Fatalf("missing invite code got %d", code)
	}
	// Bad invite code
	if code := do(`{"name":"Budi","email":"budi@x.id","password":"secret12","invite_code":"WRONG"}`); code != 400 {
		t.Fatalf("bad invite code got %d", code)
	}
	// Password too short
	if code := do(`{"name":"Budi","email":"budi@x.id","password":"short","invite_code":"ABC123"}`); code != 400 {
		t.Fatalf("short password got %d", code)
	}
	// Valid registration
	if code := do(`{"name":"Budi","email":"budi@x.id","password":"secret12","invite_code":"ABC123"}`); code != 201 {
		t.Fatalf("valid register got %d", code)
	}
	// Invite code now used -> reject
	if code := do(`{"name":"Budi2","email":"budi2@x.id","password":"secret12","invite_code":"ABC123"}`); code != 400 {
		t.Fatalf("reused invite code got %d", code)
	}
	// Second successful registration with a different code (regression test:
	// must succeed even though the first code was consumed to NULL).
	if code := do(`{"name":"Cici","email":"cici@x.id","password":"secret12","invite_code":"DEF456"}`); code != 201 {
		t.Fatalf("second valid register got %d", code)
	}
	// Email already registered -> reject
	if code := do(`{"name":"Budi3","email":"budi@x.id","password":"secret12","invite_code":"DEF456"}`); code != 400 {
		t.Fatalf("duplicate email got %d", code)
	}

	// Verify user created with role client and linked
	var user model.User
	if err := db.Where("email = ?", "budi@x.id").First(&user).Error; err != nil {
		t.Fatal("user not created")
	}
	if user.Role != "client" {
		t.Fatalf("role %q", user.Role)
	}
	var updated model.Client
	if err := db.First(&updated, client.ID).Error; err != nil {
		t.Fatal(err)
	}
	if updated.UserID != user.ID || updated.InviteCode != nil {
		t.Fatalf("client not linked: user_id=%d invite=%v", updated.UserID, updated.InviteCode)
	}
}
