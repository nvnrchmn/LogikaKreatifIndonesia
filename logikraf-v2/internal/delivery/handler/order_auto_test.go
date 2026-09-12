package handler

import (
	"testing"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func TestEnsureOrderFromPayment(t *testing.T) {
	pt := model.PaymentTransaction{
		InvoiceRef:   "TEST-AUTO-1",
		Provider:     "xendit",
		ProviderTxID: "trx-1",
		ClientName:   "Budi Test",
		ClientEmail:  "budi@example.com",
		ClientPhone:  "628123456789",
		GrossAmount:  1499000,
	}

	id1, created1 := ensureOrderFromPayment(pt)
	if !created1 || id1 == 0 {
		t.Fatalf("harusnya order dibuat, dapat id=%d created=%v", id1, created1)
	}
	var o model.Order
	if err := model.DB.First(&o, id1).Error; err != nil {
		t.Fatalf("order tidak tersimpan: %v", err)
	}
	if o.Status != "paid" || o.TotalAmount != 1499000 {
		t.Fatalf("order tidak sesuai: status=%s total=%d", o.Status, o.TotalAmount)
	}

	var cl model.Client
	if err := model.DB.Where("email = ?", "budi@example.com").First(&cl).Error; err != nil {
		t.Fatal("klien tidak dibuat otomatis")
	}
	if cl.ID != o.ClientID {
		t.Fatalf("order tidak tertaut ke klien: client_id=%d klien=%d", o.ClientID, cl.ID)
	}

	// Idempotent: pembayaran yang sama tidak boleh membuat order kedua
	id2, created2 := ensureOrderFromPayment(pt)
	if created2 || id2 != id1 {
		t.Fatalf("tidak idempotent: id=%d created=%v", id2, created2)
	}
}
