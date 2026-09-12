package wa

import (
	"os"
	"testing"
)

// TestSendLive — uji kirim nyata ke GoWA. Hanya berjalan bila WA_LIVE_TO diisi,
// supaya CI/uji biasa tidak mengirim pesan tanpa sengaja.
func TestSendLive(t *testing.T) {
	to := os.Getenv("WA_LIVE_TO")
	if to == "" {
		t.Skip("WA_LIVE_TO kosong — lewati uji kirim nyata")
	}
	if err := New().Send(to, "Uji integrasi Logikraf: notifikasi WhatsApp sudah aktif."); err != nil {
		t.Fatalf("gagal kirim: %v", err)
	}
	t.Log("terkirim ke", to)
}
