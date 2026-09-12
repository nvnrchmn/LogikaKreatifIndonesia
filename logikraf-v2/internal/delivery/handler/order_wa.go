package handler

import (
	"strconv"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/wa"
)

// notifyOrderWA — kabari klien & admin lewat WhatsApp saat pesanan dibuat.
// Nomor admin dari settings `admin_notify_wa` (kosong = tidak dikirim).
func notifyOrderWA(pt model.PaymentTransaction, orderID uint) {
	c := wa.New()
	if !c.Enabled() {
		return
	}
	amount := "Rp " + strconv.Itoa(int(pt.GrossAmount))
	if admin := setting("admin_notify_wa", "logikraf"); admin != "" {
		_ = c.Send(admin, "Pesanan baru masuk\n"+
			"Order #"+strconv.Itoa(int(orderID))+"\n"+
			"Klien: "+pt.ClientName+"\n"+
			"Jumlah: "+amount+"\n"+
			"Ref: "+pt.InvoiceRef)
	}
	if pt.ClientPhone != "" {
		_ = c.Send(pt.ClientPhone, "Terima kasih, pembayaran Anda sudah kami terima.\n"+
			"Order #"+strconv.Itoa(int(orderID))+"\n"+
			"Jumlah: "+amount+"\n\n"+
			"Tim Logikraf akan menghubungi Anda untuk langkah selanjutnya.")
	}
}
