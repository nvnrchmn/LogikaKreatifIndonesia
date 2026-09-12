package invoice

import (
	"os"
	"testing"
	"time"
)

// TestWriteSample — menulis contoh invoice untuk peninjauan desain.
// Hanya berjalan bila env INVOICE_SAMPLE diisi path keluaran.
func TestWriteSample(t *testing.T) {
	out := os.Getenv("INVOICE_SAMPLE")
	if out == "" {
		t.Skip("INVOICE_SAMPLE kosong")
	}
	pdf, err := Build(Data{
		Number:     "LK-INV-2026-0035",
		Status:     "paid",
		IssueDate:  time.Date(2026, 9, 15, 0, 0, 0, 0, time.UTC),
		ClientName: "Nova Nurachman",
		Company:    "PT Logika Kreatif Indonesia",
		Email:      "novanurachman@logikraf.id",
		Phone:      "+62 898-3342-429",
		Address:    "Jl. Cijengkol Setu No.35a, Bekasi 17320",
		Items: []Item{
			{Desc: "Pesanan LK-1789201323476-1 - Paket Logikraf Starter", Amount: 1499000},
		},
		Total:       1499000,
		Paid:        1499000,
		Outstanding: 0,
		Notes:       "Terima kasih telah bekerja sama dengan Logikraf.",
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(out, pdf, 0o644); err != nil {
		t.Fatal(err)
	}
	t.Logf("sample ditulis: %s (%d byte)", out, len(pdf))
}
