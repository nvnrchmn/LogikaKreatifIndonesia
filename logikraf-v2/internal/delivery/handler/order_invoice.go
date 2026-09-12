package handler

import (
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/invoice"
)

// invoicePDFForPayment — PDF invoice dari data pembayaran. Bila gagal, kembalikan
// nil supaya email tetap terkirim tanpa lampiran (notifikasi tidak boleh gagal
// hanya karena PDF).
func invoicePDFForPayment(pt model.PaymentTransaction) []byte {
	status := "paid"
	if pt.Status != "" && pt.Status != "settled" {
		status = pt.Status
	}
	desc := "Pembayaran " + pt.Provider
	if pt.InvoiceRef != "" {
		desc += " - " + pt.InvoiceRef
	}
	pdf, err := invoice.Build(invoice.Data{
		Number:      pt.InvoiceRef,
		Status:      status,
		IssueDate:   time.Now(),
		ClientName:  pt.ClientName,
		Email:       pt.ClientEmail,
		Phone:       pt.ClientPhone,
		Items:       []invoice.Item{{Desc: desc, Amount: pt.GrossAmount}},
		Total:       pt.GrossAmount,
		Paid:        pt.GrossAmount,
		Outstanding: 0,
		Notes:       "Terima kasih atas pembayaran Anda.",
	})
	if err != nil {
		return nil
	}
	return pdf
}
