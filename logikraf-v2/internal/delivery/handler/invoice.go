package handler

import (
	"bytes"
	"fmt"
	"time"

	"github.com/go-pdf/fpdf"
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

func GetInvoices(c fiber.Ctx) error {
	var items []model.Invoice
	if err := model.DB.Order("created_at desc").Limit(1000).Find(&items).Error; err != nil { // Max 1000 rows. If dataset grows, implement pagination.
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

func CreateInvoice(c fiber.Ctx) error {
	var input model.Invoice
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	if input.InvoiceNumber == "" {
		return c.Status(400).JSON(fiber.Map{"error": "invoice_number required"})
	}
	if input.Status == "" {
		input.Status = "draft"
	}
	if input.Type == "" {
		input.Type = "invoice"
	}
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}

func UpdateInvoice(c fiber.Ctx) error {
	id := c.Params("id")
	var input model.Invoice
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var inv model.Invoice
	if err := model.DB.First(&inv, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	inv.InvoiceNumber = input.InvoiceNumber
	inv.Type = input.Type
	inv.Total = input.Total
	inv.Notes = input.Notes
	inv.OrderID = input.OrderID
	inv.IssueDate = input.IssueDate
	inv.DueDate = input.DueDate
	// Status is derived from money received, not taken from the form: a manual
	// edit must not be able to mark an invoice "paid" while a balance remains.
	// paid_amount is deliberately not writable here — it only moves through
	// RecordInvoicePayment so every change has a matching ledger entry.
	inv.Status = input.Status
	inv.Status = inv.DeriveStatus(time.Now())
	if err := model.DB.Save(&inv).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(inv)
}

func DeleteInvoice(c fiber.Ctx) error {
	id := c.Params("id")
	if err := model.DB.Delete(&model.Invoice{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.SendStatus(204)
}

// DownloadInvoicePDF renders a single invoice as a PDF nota.
func DownloadInvoicePDF(c fiber.Ctx) error {
	return downloadInvoicePDF(c, c.Params("id"), false)
}

// ClientDownloadInvoicePDF lets a client download their own invoice PDF.
// Scoping: the invoice must belong to an order owned by the logged-in client.
func ClientDownloadInvoicePDF(c fiber.Ctx) error {
	return downloadInvoicePDF(c, c.Params("id"), true)
}

func downloadInvoicePDF(c fiber.Ctx, id string, clientScoped bool) error {
	var inv model.Invoice
	q := model.DB.Model(&model.Invoice{})
	if clientScoped {
		clientID, _, err := clientIDForUser(c)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "client not found"})
		}
		q = q.Joins("JOIN orders ON orders.id = invoices.order_id").
			Where("orders.client_id = ?", clientID)
	}
	if err := q.First(&inv, "invoices.id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "INVOICE "+inv.InvoiceNumber)
	pdf.Ln(14)

	pdf.SetFont("Arial", "", 11)
	for _, row := range [][2]string{
		{"Nomor", inv.InvoiceNumber},
		{"Tipe", inv.Type},
		{"Status", inv.Status},
	} {
		pdf.Cell(40, 7, row[0])
		pdf.Cell(0, 7, ": "+row[1])
		pdf.Ln(7)
	}
	if inv.IssueDate != nil {
		pdf.Cell(40, 7, "Tanggal")
		pdf.Cell(0, 7, ": "+inv.IssueDate.Format("2006-01-02"))
		pdf.Ln(7)
	}
	if inv.DueDate != nil {
		pdf.Cell(40, 7, "Jatuh Tempo")
		pdf.Cell(0, 7, ": "+inv.DueDate.Format("2006-01-02"))
		pdf.Ln(7)
	}
	pdf.Ln(4)
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 8, "TOTAL")
	pdf.Cell(0, 8, fmt.Sprintf(": Rp %d", inv.Total))

	// ponytail: single-page nota; paginate when line items are added
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", `attachment; filename="invoice-`+inv.InvoiceNumber+`.pdf"`)
	return c.Send(buf.Bytes())
}
