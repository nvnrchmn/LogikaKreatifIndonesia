package handler

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func TestStageOf(t *testing.T) {
	for in, want := range map[string]int{"planning": 0, "": 0, "in_progress": 1, "review": 2, "completed": 3, "on_hold": -1, "cancelled": -1} {
		if got := stageOf(in); got != want {
			t.Fatalf("stageOf(%q)=%d ingin %d", in, got, want)
		}
	}
}

type progOut struct {
	Projects []struct {
		Name      string `json:"name"`
		Stage     int    `json:"stage"`
		OrderPaid uint   `json:"order_paid"`
		Termins   []struct {
			Status string `json:"status"`
		} `json:"termins"`
	} `json:"projects"`
}

func TestClientProgressScoping(t *testing.T) {
	withTestDB(t, &model.Client{}, &model.User{}, &model.Project{}, &model.Order{}, &model.Transaction{}, &model.Invoice{})
	start := time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC)
	ua := model.User{Name: "A", Email: "pa@uji.test", Password: "x", Role: "client"}
	model.DB.Create(&ua)
	ca := model.Client{CompanyName: "Klien A", UserID: ua.ID}
	cb := model.Client{CompanyName: "Klien B"}
	model.DB.Create(&ca)
	model.DB.Create(&cb)
	oa := model.Order{ClientID: ca.ID, UserID: ua.ID, OrderNumber: "LK-UJI-1", ProjectName: "Web A", TotalAmount: 3000000, Status: "in_progress"}
	model.DB.Create(&oa)
	model.DB.Create(&model.Project{ClientID: ca.ID, OrderID: oa.ID, Name: "Web A", Status: "in_progress", StartDate: &start})
	model.DB.Create(&model.Project{ClientID: cb.ID, Name: "Web B", Status: "planning"})
	model.DB.Create(&model.Transaction{OrderID: oa.ID, TransactionReference: "TRX-A-1", MilestoneName: "DP 50%", Amount: 1500000, Status: "settled"})

	app := fiber.New()
	app.Use(func(c fiber.Ctx) error { c.Locals("user_id", ua.ID); return c.Next() })
	app.Get("/p", ClientProgress)
	res, err := app.Test(httptest.NewRequest("GET", "/p", nil))
	if err != nil {
		t.Fatal(err)
	}
	var out progOut
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatal(err)
	}
	if len(out.Projects) != 1 {
		t.Fatalf("proyek terlihat = %d, ingin 1 (proyek klien lain bocor?)", len(out.Projects))
	}
	p := out.Projects[0]
	if p.Name != "Web A" || p.Stage != 1 || p.OrderPaid != 1500000 || len(p.Termins) != 1 || p.Termins[0].Status != "settled" {
		t.Fatalf("hasil tidak sesuai: %+v", p)
	}
}
