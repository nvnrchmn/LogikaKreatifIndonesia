package invoice

import (
	"os"
	"strings"
)

// Identitas penerbit invoice (sesuai akta: Perseroan Perorangan).
const (
	IssuerName    = "PT Logika Kreatif Indonesia"
	IssuerForm    = "Perseroan Perorangan"
	IssuerAddress = "Jl. Cijengkol Setu No.35a, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat 17320"
	IssuerEmail   = "support@logikraf.id"
	IssuerPhone   = "+62 898-3342-429"
	IssuerSite    = "logikraf.id"
)

// logoPath — lokasi berkas logo kop. Ditaruh di luar repo supaya tidak
// terhapus saat deploy; bisa dioverride lewat env INVOICE_LOGO.
func logoPath() string {
	if p := strings.TrimSpace(os.Getenv("INVOICE_LOGO")); p != "" {
		return p
	}
	return "/www/wwwroot/logikraf.id/uploads/brand/logo-invoice.png"
}

// logoExists — true bila berkas logo ada dan bisa dibaca.
func logoExists() bool {
	_, err := os.Stat(logoPath())
	return err == nil
}
