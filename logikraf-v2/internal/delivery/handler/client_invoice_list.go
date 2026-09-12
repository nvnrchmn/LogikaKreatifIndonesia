package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ClientInvoices — daftar invoice milik klien yang login (untuk portal).
func ClientInvoices(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "akun belum tertaut ke data klien"})
	}
	type invRow struct {
		ID            uint   `json:"id"`
		InvoiceNumber string `json:"invoice_number"`
		Status        string `json:"status"`
		Total         uint   `json:"total"`
		PaidAmount    uint   `json:"paid_amount"`
		Outstanding   uint   `json:"outstanding"`
		OrderID       *uint  `json:"order_id"`
		OrderNumber   string `json:"order_number"`
		ProjectName   string `json:"project_name"`
		IssuedAt      string `json:"issued_at"`
		DueAt         string `json:"due_at"`
	}
	rows := []invRow{}
	model.DB.Model(&model.Invoice{}).
		Select("invoices.id, invoices.invoice_number, invoices.status, invoices.total, invoices.paid_amount, " +
			"invoices.order_id, orders.order_number, orders.project_name, " +
			"DATE_FORMAT(COALESCE(invoices.issue_date, invoices.created_at), '%Y-%m-%d') as issued_at, " +
			"COALESCE(DATE_FORMAT(invoices.due_date, '%Y-%m-%d'), '') as due_at").
		Joins("JOIN orders ON orders.id = invoices.order_id").
		Where("orders.client_id = ?", cid).
		Order("invoices.created_at desc").
		Scan(&rows)
	for i := range rows {
		if rows[i].Total > rows[i].PaidAmount {
			rows[i].Outstanding = rows[i].Total - rows[i].PaidAmount
		}
	}
	return c.JSON(fiber.Map{"invoices": rows, "total": len(rows)})
}
