package handler

import (
	"strconv"
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
)

// ensureOrderFromPayment — jaring pengaman alur order: bila pembayaran sudah
// settled tapi Order belum ada, buat Order + data klien otomatis (idempotent).
func ensureOrderFromPayment(pt model.PaymentTransaction) (uint, bool) {
	ref := strings.TrimSpace(pt.InvoiceRef)
	if ref == "" {
		ref = strings.TrimSpace(pt.ProviderTxID)
	}
	if ref == "" {
		return 0, false
	}
	var existing model.Order
	if err := model.DB.Where("order_number = ?", ref).First(&existing).Error; err == nil {
		return existing.ID, false
	}
	clientID := uint(0)
	if pt.ClientEmail != "" {
		var client model.Client
		if err := model.DB.Where("email = ?", pt.ClientEmail).First(&client).Error; err != nil {
			client = model.Client{PICName: pt.ClientName, Email: pt.ClientEmail, Phone: pt.ClientPhone}
			if err := model.DB.Create(&client).Error; err == nil {
				clientID = client.ID
			}
		} else {
			clientID = client.ID
		}
	}

	order := model.Order{
		ClientID:    clientID,
		OrderNumber: ref,
		ProjectName: "Pesanan " + ref,
		TotalAmount: pt.GrossAmount,
		Status:      "paid",
	}
	if err := model.DB.Create(&order).Error; err != nil {
		return 0, false
	}
	return order.ID, true
}

// notifyAdminNewOrder — kabari admin lewat email bahwa ada pesanan/pembayaran baru.
// Tujuan bisa diatur di settings `admin_notify_email` (default admin@logikraf.id).
func notifyAdminNewOrder(pt model.PaymentTransaction, orderID uint) {
	to := setting("admin_notify_email", "logikraf")
	if strings.TrimSpace(to) == "" {
		to = "admin@logikraf.id"
	}
	body := "Ada pembayaran masuk dan pesanan dibuat otomatis.\n\n" +
		"Order ID    : " + strconv.Itoa(int(orderID)) + "\n" +
		"Referensi   : " + pt.InvoiceRef + "\n" +
		"Nama klien  : " + pt.ClientName + "\n" +
		"Email klien : " + pt.ClientEmail + "\n" +
		"WA klien    : " + pt.ClientPhone + "\n" +
		"Jumlah      : Rp " + strconv.Itoa(int(pt.GrossAmount)) + "\n" +
		"Provider    : " + pt.Provider + " (" + pt.ProviderTxID + ")\n\n" +
		"Cek panel: https://logikraf.id/admin/orders\n"
	_ = email.Send(email.DefaultConfig(), []string{to}, "Pesanan baru: "+pt.InvoiceRef, body)
}
