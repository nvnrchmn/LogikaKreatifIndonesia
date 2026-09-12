package handler

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"gorm.io/gorm"
)

// withTestDB — tes memakai DB sqlite sendiri lalu mengembalikan model.DB semula,
// supaya tidak bergantung pada urutan tes dalam paket.
func withTestDB(t *testing.T, tables ...interface{}) {
	orig := model.DB
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(tables...); err != nil {
		t.Fatal(err)
	}
	model.DB = db
	t.Cleanup(func() { model.DB = orig })
}

// TestTicketScoping — pastikan klien hanya bisa membuka & membalas tiketnya sendiri.
func TestTicketScoping(t *testing.T) {
	withTestDB(t, &model.User{}, &model.Ticket{}, &model.TicketReply{})
	a := model.User{Name: "Klien A", Email: "a@uji.test", Password: "x", Role: "client"}
	b := model.User{Name: "Klien B", Email: "b@uji.test", Password: "x", Role: "client"}
	if err := model.DB.Create(&a).Error; err != nil {
		t.Fatal(err)
	}
	if err := model.DB.Create(&b).Error; err != nil {
		t.Fatal(err)
	}
	tk := model.Ticket{UserID: a.ID, Subject: "Tiket A", Description: "halo", Priority: "medium", Status: "open"}
	if err := model.DB.Create(&tk).Error; err != nil {
		t.Fatal(err)
	}
	id := strconv.Itoa(int(tk.ID))

	// Sebagai klien B (bukan pemilik tiket)
	other := fiber.New()
	other.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", b.ID)
		return c.Next()
	})
	other.Get("/t/:id", ClientTicket)
	other.Post("/t/:id/replies", ReplyClientTicket)

	res, err := other.Test(httptest.NewRequest("GET", "/t/"+id, nil))
	if err != nil {
		t.Fatal(err)
	}
	if res.StatusCode != 404 {
		t.Fatalf("klien lain bisa membaca tiket: status %d (ingin 404)", res.StatusCode)
	}

	body, _ := json.Marshal(map[string]string{"body": "menyusup"})
	req := httptest.NewRequest("POST", "/t/"+id+"/replies", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	res2, err := other.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	if res2.StatusCode != 404 {
		t.Fatalf("klien lain bisa membalas tiket: status %d (ingin 404)", res2.StatusCode)
	}

	// Sebagai pemilik tiket
	owner := fiber.New()
	owner.Use(func(c fiber.Ctx) error {
		c.Locals("user_id", a.ID)
		return c.Next()
	})
	owner.Get("/t/:id", ClientTicket)
	owner.Post("/t/:id/replies", ReplyClientTicket)

	res3, err := owner.Test(httptest.NewRequest("GET", "/t/"+id, nil))
	if err != nil {
		t.Fatal(err)
	}
	if res3.StatusCode != 200 {
		t.Fatalf("pemilik tidak bisa membaca tiketnya: status %d (ingin 200)", res3.StatusCode)
	}

	req3 := httptest.NewRequest("POST", "/t/"+id+"/replies", bytes.NewReader(body))
	req3.Header.Set("Content-Type", "application/json")
	res4, err := owner.Test(req3)
	if err != nil {
		t.Fatal(err)
	}
	if res4.StatusCode != 201 {
		t.Fatalf("pemilik tidak bisa membalas tiketnya: status %d (ingin 201)", res4.StatusCode)
	}

	var n int64
	model.DB.Model(&model.TicketReply{}).Where("ticket_id = ?", tk.ID).Count(&n)
	if n != 1 {
		t.Fatalf("jumlah balasan = %d (ingin 1 — balasan penyusup tidak boleh tersimpan)", n)
	}
}
