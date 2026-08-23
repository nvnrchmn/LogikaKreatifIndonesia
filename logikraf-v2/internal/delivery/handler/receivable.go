package handler

import (
	"strconv"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

// invoiceView decorates an invoice with the derived numbers the admin UI needs,
// so the frontend never has to recompute money logic.
type invoiceView struct {
	model.Invoice
	Outstanding   uint   `json:"outstanding"`
	DaysOverdue   int    `json:"days_overdue"`
	ClientName    string `json:"client_name"`
	OrderNumber   string `json:"order_number"`
}

func decorateInvoice(inv model.Invoice, now time.Time) invoiceView {
	v := invoiceView{Invoice: inv, Outstanding: inv.Outstanding()}
	if inv.DueDate != nil && inv.Outstanding() > 0 && now.After(*inv.DueDate) {
		// Compare calendar dates, not raw duration: an invoice due 10 days ago is
		// "telat 10 hari" regardless of the time of day it was stored, whereas
		// truncating the hour difference reports 9.
		due := time.Date(inv.DueDate.Year(), inv.DueDate.Month(), inv.DueDate.Day(), 0, 0, 0, 0, now.Location())
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		if days := int(today.Sub(due).Hours() / 24); days > 0 {
			v.DaysOverdue = days
		}
	}
	if inv.OrderID != nil {
		var order model.Order
		if err := model.DB.First(&order, *inv.OrderID).Error; err == nil {
			v.OrderNumber = order.OrderNumber
			var client model.Client
			if err := model.DB.First(&client, order.ClientID).Error; err == nil {
				v.ClientName = client.PICName
				if v.ClientName == "" {
					v.ClientName = client.CompanyName
				}
			}
		}
	}
	return v
}

// RecordInvoicePayment adds a received amount to an invoice and re-derives its
// status. This is what makes DP -> pelunasan possible: each payment accumulates
// into paid_amount instead of flipping a single paid/unpaid flag.
//
// It also writes a Transaction row so the money shows up in the ledger, and
// refuses overpayment rather than silently storing a negative balance.
func RecordInvoicePayment(c fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		Amount        uint   `json:"amount"`
		PaymentMethod string `json:"payment_method"`
		Reference     string `json:"reference"`
		Note          string `json:"note"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Amount == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "amount required"})
	}

	var inv model.Invoice
	if err := model.DB.First(&inv, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	outstanding := inv.Outstanding()
	if outstanding == 0 {
		return c.Status(409).JSON(fiber.Map{"error": "invoice already fully paid"})
	}
	if in.Amount > outstanding {
		return c.Status(409).JSON(fiber.Map{
			"error":       "amount exceeds outstanding balance",
			"outstanding": outstanding,
		})
	}

	now := time.Now()
	inv.PaidAmount += in.Amount
	inv.Status = inv.DeriveStatus(now)
	if err := model.DB.Save(&inv).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	// Mirror the payment into the transaction ledger.
	// transaction_reference is UNIQUE, so the fallback must stay unique even when
	// two payments on the same invoice land within the same second (DP followed by
	// pelunasan). Including the new paid_amount guarantees that.
	ref := in.Reference
	if ref == "" {
		ref = "MAN-" + inv.InvoiceNumber + "-" + strconv.FormatUint(uint64(inv.PaidAmount), 10) +
			"-" + strconv.FormatInt(now.UnixNano(), 10)
	}
	method := in.PaymentMethod
	if method == "" {
		method = "manual"
	}
	milestone := in.Note
	if milestone == "" {
		if inv.Outstanding() == 0 {
			milestone = "Pelunasan " + inv.InvoiceNumber
		} else {
			milestone = "Pembayaran sebagian " + inv.InvoiceNumber
		}
	}
	tx := model.Transaction{
		TransactionReference: ref,
		MilestoneName:        milestone,
		Amount:               in.Amount,
		PaymentMethod:        method,
		Status:               "settled",
		SettledAt:            &now,
	}
	if inv.OrderID != nil {
		tx.OrderID = *inv.OrderID
	}
	// Do not swallow this error: a payment that is not in the ledger is money
	// the finance report cannot see. A duplicate reference is a caller mistake.
	if err := model.DB.Create(&tx).Error; err != nil {
		return c.Status(409).JSON(fiber.Map{
			"error":     "payment recorded but ledger entry failed (duplicate reference?)",
			"reference": ref,
		})
	}

	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "invoice_payment_recorded",
		Title:    "Pembayaran Invoice Dicatat",
		Message: "Invoice " + inv.InvoiceNumber + " menerima Rp " +
			strconv.Itoa(int(in.Amount)) + ". Sisa tagihan: Rp " +
			strconv.Itoa(int(inv.Outstanding())) + ".",
		RefTable: "invoices",
		RefID:    inv.ID,
		IsRead:   true,
	})

	return c.JSON(decorateInvoice(inv, now))
}

// GetInvoicesEnriched lists invoices with outstanding balance and client name.
func GetInvoicesEnriched(c fiber.Ctx) error {
	var items []model.Invoice
	q := model.DB.Order("created_at desc").Limit(1000)
	if s := c.Query("status"); s != "" {
		q = q.Where("status = ?", s)
	}
	if err := q.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	now := time.Now()
	out := make([]invoiceView, 0, len(items))
	for _, inv := range items {
		out = append(out, decorateInvoice(inv, now))
	}
	return c.JSON(out)
}

// GetReceivables returns unpaid invoices grouped into aging buckets — the
// "siapa berutang berapa, sudah telat berapa lama" view. Drafts are excluded
// because they have not been issued to the client yet.
func GetReceivables(c fiber.Ctx) error {
	var items []model.Invoice
	if err := model.DB.
		Where("status <> ? AND status <> ?", "paid", "draft").
		Order("due_date asc").
		Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	now := time.Now()
	type bucket struct {
		Label string        `json:"label"`
		Count int           `json:"count"`
		Total uint          `json:"total"`
		Items []invoiceView `json:"items"`
	}
	buckets := []*bucket{
		{Label: "Belum jatuh tempo"},
		{Label: "1-30 hari"},
		{Label: "31-60 hari"},
		{Label: "60+ hari"},
	}

	var totalOutstanding uint
	var overdueOutstanding uint
	for _, inv := range items {
		if inv.Outstanding() == 0 {
			continue
		}
		v := decorateInvoice(inv, now)
		totalOutstanding += v.Outstanding

		idx := 0
		switch {
		case v.DaysOverdue <= 0:
			idx = 0
		case v.DaysOverdue <= 30:
			idx = 1
		case v.DaysOverdue <= 60:
			idx = 2
		default:
			idx = 3
		}
		if idx > 0 {
			overdueOutstanding += v.Outstanding
		}
		buckets[idx].Count++
		buckets[idx].Total += v.Outstanding
		buckets[idx].Items = append(buckets[idx].Items, v)
	}

	return c.JSON(fiber.Map{
		"total_outstanding":   totalOutstanding,
		"overdue_outstanding": overdueOutstanding,
		"invoice_count":       len(items),
		"buckets":             buckets,
	})
}

// RefreshInvoiceStatuses re-derives status for every invoice, flipping issued
// invoices past their due date to overdue. Safe to run repeatedly.
func RefreshInvoiceStatuses(c fiber.Ctx) error {
	var items []model.Invoice
	if err := model.DB.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	now := time.Now()
	changed := 0
	for _, inv := range items {
		next := inv.DeriveStatus(now)
		if next != inv.Status {
			model.DB.Model(&model.Invoice{}).Where("id = ?", inv.ID).Update("status", next)
			changed++
		}
	}
	return c.JSON(fiber.Map{"checked": len(items), "updated": changed})
}
