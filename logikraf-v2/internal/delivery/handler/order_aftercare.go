package handler

import (
	"strconv"
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"github.com/logikraf/logikraf-v2/pkg/wa"
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
		return "Pantau pesanan Anda di " + portalURL("/login") + " (daftar dengan email ini)."
	}
	return "Kode aktivasi portal: " + *client.InviteCode +
		"\nDaftar di " + portalURL("/register") + " dengan email ini untuk memantau pesanan."
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

// statusLabel — terjemahan status internal ke bahasa yang enak dibaca klien.
func statusLabel(s string) string {
	switch s {
	case "pending":
		return "menunggu pembayaran"
	case "paid":
		return "pembayaran diterima"
	case "active":
		return "sedang dikerjakan"
	case "on_hold":
		return "dijeda sementara"
	case "completed":
		return "selesai"
	case "cancelled":
		return "dibatalkan"
	case "refunded":
		return "dana dikembalikan"
	}
	return s
}

// notifyOrderStatusChange — kabari klien (email + WA) saat status pesanan berubah,
// supaya mereka tidak perlu menanyakan progres (P2-8).
func notifyOrderStatusChange(order model.Order, prev, now, note string) {
	var client model.Client
	if order.ClientID == 0 || model.DB.First(&client, order.ClientID).Error != nil {
		return
	}
	label := statusLabel(now)
	plain := "Status pesanan " + order.OrderNumber + " kini: " + label +
		" (sebelumnya " + statusLabel(prev) + ")."
	if note != "" {
		plain += "\nCatatan: " + note
	}
	if client.Email != "" {
		html := "<p>Status pesanan <strong>" + order.OrderNumber + "</strong> kini: <strong>" +
			label + "</strong> (sebelumnya " + statusLabel(prev) + ").</p>"
		if note != "" {
			html += "<p>Catatan: " + note + "</p>"
		}
		html += `<p>Pantau pesanan Anda di <a href="` + portalURL("/orders") + `">portal klien</a>.</p>`
		_ = email.Send(email.DefaultConfig(), []string{client.Email},
			"Status pesanan "+order.OrderNumber+": "+label, html)
	}
	if client.Phone != "" {
		_ = wa.New().Send(client.Phone, plain+"\n\nPantau di "+portalURL("/orders")+"/client")
	}
}

// portalURL — URL halaman portal klien (settings `company_client_portal_url`),
// fallback ke domain utama selama subdomain belum diaktifkan.
func portalURL(path string) string {
	if v := strings.TrimSpace(setting("company_client_portal_url", "logikraf")); v != "" {
		return strings.TrimRight(v, "/") + path
	}
	return "https://logikraf.id/client" + path
}
