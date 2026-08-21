package handler

import (
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func TestCreateOrderRequiresExistingClientAndUsesClientID(t *testing.T) {
	model.DB.Exec("DELETE FROM projects")
	model.DB.Exec("DELETE FROM orders")
	model.DB.Exec("DELETE FROM clients")

	client := model.Client{CompanyName: "Client Test", PICName: "PIC Test"}
	if err := model.DB.Create(&client).Error; err != nil {
		t.Fatal(err)
	}

	app := fiber.New()
	app.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", uint(9999))
		return c.Next()
	})
	app.Post("/orders", CreateOrder)

	missingClient := httptest.NewRequest("POST", "/orders", strings.NewReader(`{"order_number":"ORD-NO-CLIENT","project_name":"Project","client_id":99999}`))
	missingClient.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(missingClient)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 400 {
		t.Fatalf("missing client got %d, want 400", resp.StatusCode)
	}

	validBody := fmt.Sprintf(`{"order_number":"ORD-CLIENT-1","project_name":"Project","client_id":%d}`, client.ID)
	valid := httptest.NewRequest("POST", "/orders", strings.NewReader(validBody))
	valid.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(valid)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 201 {
		t.Fatalf("valid order got %d, want 201", resp.StatusCode)
	}

	var order model.Order
	if err := json.NewDecoder(resp.Body).Decode(&order); err != nil {
		t.Fatal(err)
	}
	if order.ClientID != client.ID {
		t.Fatalf("order client_id %d, want %d", order.ClientID, client.ID)
	}

	var project model.Project
	if err := model.DB.Where("order_id = ?", order.ID).First(&project).Error; err != nil {
		t.Fatal(err)
	}
	if project.ClientID != client.ID {
		t.Fatalf("project client_id %d, want %d", project.ClientID, client.ID)
	}
	if project.ClientID == 9999 {
		t.Fatal("project incorrectly uses authenticated admin as client")
	}
}
