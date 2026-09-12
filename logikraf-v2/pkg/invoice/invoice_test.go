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

// TestBuildLunasDanLegal — invoice lunas menampilkan "Lunas pada <tanggal>" (bukan
// "Jatuh tempo"), dan baris NIB/NPWP hanya muncul bila datanya diisi. Dua contoh PDF
// ditulis ke /tmp supaya bisa diperiksa mata/teks (verifikasi pymupdf ada di skill
// gofpdf-document-generation/references/indonesian-invoice-format.md).
func TestBuildLunasDanLegal(t *testing.T) {
	paidAt := time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC)
	due := time.Date(2026, 10, 12, 0, 0, 0, 0, time.UTC)
	base := Data{
		IssueDate:  time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC),
		DueDate:    &due,
		Company:    "PT Contoh Sejahtera",
		ClientName: "Budi Santoso",
		Items:      []Item{{Desc: "Paket Business", Amount: 1000000}},
		Total:      1000000,
		Notes:      "Terima kasih.",
	}

	lunas := base
	lunas.Number = "INV-LUNAS-001"
	lunas.Status = "paid"
	lunas.Paid = 1000000
	lunas.PaidAt = &paidAt
	lunas.NIB = "0123456789012"
	lunas.NPWP = "01.234.567.8-901.000"
	pdf, err := Build(lunas)
	if err != nil {
		t.Fatalf("gagal build invoice lunas: %v", err)
	}
	_ = os.WriteFile("/tmp/contoh-invoice-lunas.pdf", pdf, 0o644)

	belum := base
	belum.Number = "INV-BELUM-002"
	belum.Status = "overdue"
	unpaid, err := Build(belum)
	if err != nil {
		t.Fatalf("gagal build invoice belum lunas: %v", err)
	}
	_ = os.WriteFile("/tmp/contoh-invoice-belum.pdf", unpaid, 0o644)
}
