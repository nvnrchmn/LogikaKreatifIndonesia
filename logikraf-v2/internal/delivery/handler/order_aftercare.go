package handler

import (
	"strconv"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
)

// portalInfo — kode aktivasi + tautan portal klien, supaya pembeli bisa memantau
// pesanannya sendiri tanpa menunggu admin (P1-4).
func portalInfo(mail string) string {
	if mail == "" {
		return ""
	}
	var client model.Client
	if err := model.DB.Where("email = ?", mail).First(&client).Error; err != nil {
		return ""
	}
	if client.InviteCode == nil || *client.InviteCode == "" {
		return "Pantau pesanan Anda di https://logikraf.id/client (daftar dengan email ini)."
	}
	return "Kode aktivasi portal: " + *client.InviteCode +
		"\nDaftar di https://logikraf.id/client/register dengan email ini untuk memantau pesanan."
}

// notifyClientNextSteps — email berisi langkah selanjutnya ke klien saat pesanan
// baru terbentuk dari pembayaran (mengurangi bolak-balik manual).
func notifyClientNextSteps(pt model.PaymentTransaction) {
	if pt.ClientEmail == "" {
		return
	}
	ref := pt.InvoiceRef
	if ref == "" {
		ref = pt.ProviderTxID
	}
	_ = email.SendOrderOnboarding(email.DefaultConfig(), pt.ClientEmail, pt.ClientName,
		ref, strconv.Itoa(int(pt.GrossAmount)), portalInfo(pt.ClientEmail))
}
