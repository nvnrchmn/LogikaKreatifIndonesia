package handler

import (
	"strconv"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
)

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
		ref, strconv.Itoa(int(pt.GrossAmount)))
}
