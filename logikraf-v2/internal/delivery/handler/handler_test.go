package handler

import (
	"encoding/json"
	"io"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

var app *fiber.App

func TestMain(m *testing.M) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	if err := db.AutoMigrate(&model.Transaction{}, &model.Order{}, &model.Invoice{}, &model.Project{}, &model.Client{}); err != nil {
		panic(err)
	}
	model.DB = db

	app = fiber.New()
	app.Get("/api/transactions", GetTransactions)
	app.Get("/api/transactions/:id", GetTransactionByID)
	app.Post("/api/transactions", CreateTransaction)
	app.Get("/api/reports/finance", GetFinanceReport)
	app.Get("/api/projects", GetProjects)
	app.Get("/api/projects/:id", GetProjectByID)
	app.Post("/api/projects", CreateProject)
	app.Put("/api/projects/:id", UpdateProject)
	app.Delete("/api/projects/:id", DeleteProject)

	os.Exit(m.Run())
}

func TestGetTransactions(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/transactions", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("got %d want 200", resp.StatusCode)
	}
}

func TestCreateThenGetTransaction(t *testing.T) {
	body := `{"order_id":1,"transaction_reference":"TRX-TEST-1","milestone_name":"DP","amount":500000,"payment_method":"transfer","status":"settled"}`
	req := httptest.NewRequest("POST", "/api/transactions", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 201 {
		b, _ := io.ReadAll(resp.Body)
		t.Fatalf("create got %d: %s", resp.StatusCode, b)
	}
	var created model.Transaction
	json.NewDecoder(resp.Body).Decode(&created)
	if created.ID == 0 {
		t.Fatal("no id assigned")
	}

	resp2, err := app.Test(httptest.NewRequest("GET", "/api/transactions/1", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp2.StatusCode != 200 {
		t.Fatalf("get by id got %d", resp2.StatusCode)
	}
	var got model.Transaction
	json.NewDecoder(resp2.Body).Decode(&got)
	if got.TransactionReference != "TRX-TEST-1" {
		t.Fatalf("got ref %q", got.TransactionReference)
	}
}

func TestFinanceReport(t *testing.T) {
	resp, err := app.Test(httptest.NewRequest("GET", "/api/reports/finance", nil))
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("got %d", resp.StatusCode)
	}
	var out map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	if _, ok := out["total_orders"]; !ok {
		t.Fatalf("missing total_orders in %v", out)
	}
}
