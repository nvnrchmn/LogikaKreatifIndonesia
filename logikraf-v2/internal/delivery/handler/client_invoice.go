package handler

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/invoice"
)

// ClientInvoicePDF — klien mengunduh invoice miliknya sendiri sebagai PDF.
// Kepemilikan diverifikasi lewat relasi invoice → pesanan → client_id.
func ClientInvoicePDF(c fiber.Ctx) error {
	cid, cl, err := clientIDForUser(c)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "akun belum tertaut ke data klien"})
	}
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "id invoice tidak valid"})
	}
	var inv model.Invoice
	if err := model.DB.First(&inv, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "invoice tidak ditemukan"})
	}
	if inv.OrderID == nil {
		return c.Status(403).JSON(fiber.Map{"error": "invoice ini bukan milik akun Anda"})
	}
	var order model.Order
	if err := model.DB.First(&order, *inv.OrderID).Error; err != nil || order.ClientID != cid {
		return c.Status(403).JSON(fiber.Map{"error": "invoice ini bukan milik akun Anda"})
	}
	issue := inv.CreatedAt
	if inv.IssueDate != nil {
		issue = *inv.IssueDate
	}
	outstanding := uint(0)
	if inv.Total > inv.PaidAmount {
		outstanding = inv.Total - inv.PaidAmount
	}
	note := inv.Notes
	if strings.TrimSpace(note) == "" {
		note = "Terima kasih telah bekerja sama dengan Logikraf."
	}
	pdf, err := invoice.Build(invoice.Data{
		Number:      inv.InvoiceNumber,
		Status:      inv.Status,
		IssueDate:   issue,
		ClientName:  pickName(cl.PICName, cl.CompanyName),
		Company:     cl.CompanyName,
		Email:       cl.Email,
		Phone:       cl.Phone,
		Address:     cl.Address,
		Items:       []invoice.Item{{Desc: "Pesanan " + order.OrderNumber + " — " + order.ProjectName, Amount: inv.Total}},
		Total:       inv.Total,
		Paid:        inv.PaidAmount,
		Outstanding: outstanding,
		PaidAt:      inv.PaidAt,
		// Identitas legal penerbit diambil dari Settings admin (satu sumber data);
		// kosong = baris NIB/NPWP tidak dicetak.
		NIB:   setting("company_legal_nib", resolveTenant(c)),
		NPWP:  setting("company_legal_npwp", resolveTenant(c)),
		Notes: note,
	})
	if err != nil || len(pdf) == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "gagal membuat PDF invoice"})
	}
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment; filename=\"Invoice-"+inv.InvoiceNumber+".pdf\"")
	return c.Send(pdf)
}

func pickName(a, b string) string {
	if strings.TrimSpace(a) != "" {
		return a
	}
	return b
}
