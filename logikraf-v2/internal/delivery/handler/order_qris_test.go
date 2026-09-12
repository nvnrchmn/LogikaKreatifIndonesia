package handler

import (
	"testing"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func TestOrderDariQris(t *testing.T) {
	if err := model.DB.AutoMigrate(&model.Package{}, &model.QrisPayment{}); err != nil {
		t.Fatal(err)
	}
	pkg := model.Package{Name: "Paket Uji QRIS", Price: 1500000}
	if err := model.DB.Create(&pkg).Error; err != nil {
		t.Fatal(err)
	}

	ref := "LK-1700000000000-" + itoaUint(pkg.ID)
	p := model.QrisPayment{
		ReferenceID: ref,
		ExternalID:  ref,
		Amount:      1500000,
		Status:      "paid",
		ClientName:  "Siti Uji",
		ClientEmail: "siti@contoh.id",
	}
	if err := model.DB.Create(&p).Error; err != nil {
		t.Fatal(err)
	}

	// 1. Order dibuat otomatis, tertaut klien + paket, status pending.
	ensurePendingOrderForQris(&p)
	var order model.Order
	if err := model.DB.Where("order_number = ?", ref).First(&order).Error; err != nil {
		t.Fatalf("order tidak dibuat: %v", err)
	}
	if order.Status != "pending" || order.PackageID != pkg.ID {
		t.Fatalf("order tidak sesuai: status=%s pkg=%d", order.Status, order.PackageID)
	}
	var client model.Client
	if err := model.DB.First(&client, order.ClientID).Error; err != nil {
		t.Fatal("klien tidak dibuat")
	}
	if client.InviteCode == nil || *client.InviteCode == "" {
		t.Fatal("klien tanpa kode aktivasi portal")
	}

	// 2. Idempotent: checkout diulang tidak menggandakan order.
	ensurePendingOrderForQris(&p)
	var count int64
	model.DB.Model(&model.Order{}).Where("order_number = ?", ref).Count(&count)
	if count != 1 {
		t.Fatalf("order ganda: %d", count)
	}

	// 3. QRIS lunas -> order paid + kwitansi, dan aman dipanggil dua kali.
	ensureOrderForQris(&p)
	if err := model.DB.Where("order_number = ?", ref).First(&order).Error; err != nil {
		t.Fatal(err)
	}
	if order.Status != "paid" {
		t.Fatalf("order tidak lunas: %s", order.Status)
	}
	var invCount int64
	model.DB.Model(&model.Invoice{}).Where("order_id = ?", order.ID).Count(&invCount)
	if invCount == 0 {
		t.Fatal("kwitansi tidak dibuat untuk order lunas")
	}
	ensureOrderForQris(&p)
	var invCount2 int64
	model.DB.Model(&model.Invoice{}).Where("order_id = ?", order.ID).Count(&invCount2)
	if invCount2 != invCount {
		t.Fatalf("kwitansi ganda: %d -> %d", invCount, invCount2)
	}
}

func itoaUint(v uint) string {
	if v == 0 {
		return "0"
	}
	var buf [20]byte
	i := len(buf)
	for v > 0 {
		i--
		buf[i] = byte('0' + v%10)
		v /= 10
	}
	return string(buf[i:])
}
