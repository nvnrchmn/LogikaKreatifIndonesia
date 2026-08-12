package handler

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
)

// TestMain lives in handler_test.go; it does not migrate these tables.
func migratePaymentTables(t *testing.T) {
	t.Helper()
	if err := model.DB.AutoMigrate(&model.User{}, &model.Setting{}, &model.Transaction{}); err != nil {
		t.Fatal(err)
	}
}

func postJSON(t *testing.T, h fiber.Handler, path, body string) int {
	t.Helper()
	a := fiber.New()
	a.Post(path, h)
	req := httptest.NewRequest("POST", path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := a.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	return resp.StatusCode
}

func TestForcePasswordReset(t *testing.T) {
	migratePaymentTables(t)

	old, _ := auth.HashPassword("oldsecret")
	model.DB.Where("email = ?", "admin@logikraf.id").Delete(&model.User{})
	u := model.User{Name: "Admin", Email: "admin@logikraf.id", Password: old, Role: "admin"}
	if err := model.DB.Create(&u).Error; err != nil {
		t.Fatal(err)
	}

	if code := postJSON(t, ForcePasswordReset, "/api/admin/force-password-reset",
		`{"email":"admin@logikraf.id"}`); code != 200 {
		t.Fatalf("want 200, got %d", code)
	}

	var got model.User
	if err := model.DB.Where("email = ?", u.Email).First(&got).Error; err != nil {
		t.Fatal(err)
	}
	if !auth.CheckPassword("changeme123", got.Password) {
		t.Fatal("password was not reset to changeme123")
	}
	if auth.CheckPassword("oldsecret", got.Password) {
		t.Fatal("old password still valid")
	}
}

func TestXenditInvoiceMissingSetting(t *testing.T) {
	migratePaymentTables(t)
	model.DB.Where("`key` = ?", "xendit_secret_key").Delete(&model.Setting{})

	code := postJSON(t, CreateXenditInvoice, "/api/payment/xendit/invoice",
		`{"external_id":"inv-1","amount":10000,"payer_email":"a@b.c"}`)
	if code != 400 {
		t.Fatalf("want 400 when xendit_secret_key unset, got %d", code)
	}
}
