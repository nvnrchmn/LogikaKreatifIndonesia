package invoice

import (
	"bytes"
	"os"
	"testing"
	"time"
)

func TestBuild(t *testing.T) {
	due := time.Date(2026, 9, 20, 0, 0, 0, 0, time.UTC)
	pdf, err := Build(Data{
		Number:      "INV-20260912-001",
		Status:      "paid",
		IssueDate:   time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC),
		DueDate:     &due,
		Company:     "PT Contoh Sejahtera",
		ClientName:  "Budi Santoso",
		Email:       "budi@contoh.id",
		Phone:       "628123456789",
		Address:     "Jl. Contoh No. 1, Bekasi",
		Items:       []Item{{Desc: "Paket Business - website + admin panel + domain", Amount: 2499000}},
		Total:       2499000,
		Paid:        2499000,
		Outstanding: 0,
		Notes:       "Terima kasih atas kepercayaan Anda.",
	})
	if err != nil {
		t.Fatalf("gagal build: %v", err)
	}
	if len(pdf) < 1000 {
		t.Fatalf("PDF terlalu kecil: %d byte", len(pdf))
	}
	if !bytes.HasPrefix(pdf, []byte("%PDF-")) {
		t.Fatal("bukan berkas PDF")
	}
	// Simpan contoh agar bisa diperiksa mata (tidak mengganggu CI).
	_ = os.WriteFile("/tmp/contoh-invoice.pdf", pdf, 0o644)
}

func TestRp(t *testing.T) {
	cases := map[uint]string{0: "0", 1000: "1.000", 25000: "25.000", 1499000: "1.499.000"}
	for in, want := range cases {
		if got := rp(in); got != want {
			t.Errorf("rp(%d) = %q, mau %q", in, got, want)
		}
	}
}
