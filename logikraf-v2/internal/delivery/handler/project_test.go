package handler

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"gorm.io/gorm"
)

func TestProjectCRUDValidation(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&model.Project{}, &model.Client{}, &model.Package{}, &model.Order{}); err != nil {
		t.Fatal(err)
	}
	model.DB = db
	app := fiber.New()
	app.Post("/projects", CreateProject)
	app.Put("/projects/:id", UpdateProject)

	bad := httptest.NewRequest("POST", "/projects", strings.NewReader(`{"name":"Demo","status":"invalid"}`))
	bad.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(bad)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 400 {
		t.Fatalf("invalid status got %d", resp.StatusCode)
	}

	good := httptest.NewRequest("POST", "/projects", strings.NewReader(`{"name":"Demo"}`))
	good.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(good)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 201 {
		t.Fatalf("create got %d", resp.StatusCode)
	}
	var project model.Project
	if err := json.NewDecoder(resp.Body).Decode(&project); err != nil {
		t.Fatal(err)
	}
	if project.Status != "planning" {
		t.Fatalf("default status %q", project.Status)
	}

	update := httptest.NewRequest("PUT", "/projects/1", strings.NewReader(`{"name":"Demo 2","status":"in_progress"}`))
	update.Header.Set("Content-Type", "application/json")
	resp, err = app.Test(update)
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("update got %d", resp.StatusCode)
	}
}
