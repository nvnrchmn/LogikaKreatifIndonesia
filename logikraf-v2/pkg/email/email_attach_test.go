package email

import (
	"encoding/base64"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/logikraf/logikraf-v2/pkg/invoice"
)

func TestAttachmentMIME(t *testing.T) {
	data := []byte("%PDF-1.4 contoh lampiran")
	msg := string(attachmentMIME("a@x.id", "b@y.id", "Invoice INV-1", "<p>Halo</p>", "invoice-INV-1.pdf", data, "bnd-1"))
	wants := []string{
		"multipart/mixed; boundary=\"bnd-1\"",
		"Content-Type: application/pdf; name=\"invoice-INV-1.pdf\"",
		"Content-Disposition: attachment; filename=\"invoice-INV-1.pdf\"",
		"<p>Halo</p>",
		base64.StdEncoding.EncodeToString(data)[:8],
		"--bnd-1--",
	}
	for _, w := range wants {
		if !strings.Contains(msg, w) {
			t.Errorf("MIME tidak memuat %q", w)
		}
	}
}

// TestSendAttachmentLive — uji kirim NYATA (lampiran PDF invoice) ke alamat pada
// EMAIL_LIVE_TO. Dilewati bila env kosong supaya CI tidak mengirim email.
func TestSendAttachmentLive(t *testing.T) {
	to := os.Getenv("EMAIL_LIVE_TO")
	if to == "" {
		t.Skip("EMAIL_LIVE_TO kosong — lewati uji kirim email nyata")
	}
	cfg := DefaultConfig()
	if cfg.Host == "" {
		t.Skip("SMTP belum dikonfigurasi")
	}
	due := time.Now().AddDate(0, 0, 7)
	pdf, err := invoice.Build(invoice.Data{
		Number:      "INV-UJI-LAMPIRAN",
		Status:      "pending",
		IssueDate:   time.Now(),
		DueDate:     &due,
		Company:     "PT Contoh Uji",
		ClientName:  "Nova Nurachman",
		Email:       to,
		Phone:       "628983342429",
		Items:       []invoice.Item{{Desc: "Paket Business - uji lampiran otomatis", Amount: 2499000}},
		Total:       2499000,
		Paid:        500000,
		Outstanding: 1999000,
		Notes:       "Ini dokumen uji dari sistem, bukan tagihan sungguhan.",
	})
	if err != nil {
		t.Fatalf("gagal build invoice: %v", err)
	}
	if err := SendWithAttachment(cfg, []string{to},
		"Uji lampiran invoice Logikraf (uji otomatis)",
		"<p>Lampiran uji dari sistem Logikraf — ini bukan tagihan sungguhan.</p>",
		"invoice-INV-UJI-LAMPIRAN.pdf", pdf); err != nil {
		t.Fatalf("gagal kirim: %v", err)
	}
	t.Logf("email ber-lampiran terkirim ke %s (%d byte PDF)", to, len(pdf))
}
