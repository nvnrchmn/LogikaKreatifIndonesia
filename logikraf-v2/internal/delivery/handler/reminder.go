package handler

import (
	"strconv"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"

	"github.com/gofiber/fiber/v3"
)

// thousands formats an integer with Indonesian thousand separators (1.234.567).
func thousands(n uint) string {
	s := strconv.FormatUint(uint64(n), 10)
	if len(s) <= 3 {
		return s
	}
	var out []byte
	lead := len(s) % 3
	if lead > 0 {
		out = append(out, s[:lead]...)
	}
	for i := lead; i < len(s); i += 3 {
		if len(out) > 0 {
			out = append(out, '.')
		}
		out = append(out, s[i:i+3]...)
	}
	return string(out)
}

// clientEmailForInvoice resolves the client email behind an invoice, walking
// invoice -> order -> client. Returns empty when the chain is incomplete.
func clientEmailForInvoice(inv model.Invoice) (emailAddr, name string) {
	if inv.OrderID == nil {
		return "", ""
	}
	var order model.Order
	if err := model.DB.First(&order, *inv.OrderID).Error; err != nil {
		return "", ""
	}
	var client model.Client
	if err := model.DB.First(&client, order.ClientID).Error; err != nil {
		return "", ""
	}
	n := client.PICName
	if n == "" {
		n = client.CompanyName
	}
	return client.Email, n
}

// remindedToday reports whether a reminder was already logged for this invoice
// today, so a repeated run (or an impatient click) does not spam the client.
func remindedToday(invoiceID uint, now time.Time) bool {
	start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	var count int64
	model.DB.Model(&model.InvoiceReminder{}).
		Where("invoice_id = ? AND status = ? AND created_at >= ?", invoiceID, "sent", start).
		Count(&count)
	return count > 0
}

// sendReminderFor performs one reminder send and logs the outcome.
// Returns a short machine-readable result for the caller's summary.
func sendReminderFor(inv model.Invoice, now time.Time, force bool) (string, string) {
	if inv.Outstanding() == 0 {
		return "skipped", "sudah lunas"
	}
	if inv.Status == "draft" {
		return "skipped", "masih draft, belum dikirim ke klien"
	}
	to, name := clientEmailForInvoice(inv)
	if to == "" {
		return "skipped", "email klien tidak ditemukan"
	}
	if !force && remindedToday(inv.ID, now) {
		return "skipped", "sudah dikirim hari ini"
	}

	days := 0
	dueStr := "-"
	if inv.DueDate != nil {
		due := time.Date(inv.DueDate.Year(), inv.DueDate.Month(), inv.DueDate.Day(), 0, 0, 0, 0, now.Location())
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		if d := int(today.Sub(due).Hours() / 24); d > 0 {
			days = d
		}
		dueStr = inv.DueDate.Format("02-01-2006")
	}

	cfg := email.DefaultConfig()
	err := email.SendInvoiceReminder(
		cfg, to, name, inv.InvoiceNumber,
		thousands(inv.Outstanding()), thousands(inv.Total), thousands(inv.PaidAmount),
		dueStr, days,
	)

	log := model.InvoiceReminder{
		InvoiceID:   inv.ID,
		SentTo:      to,
		DaysOverdue: days,
		Outstanding: inv.Outstanding(),
		Status:      "sent",
		CreatedAt:   now,
	}
	if err != nil {
		log.Status = "failed"
		log.ErrorMessage = err.Error()
		model.DB.Create(&log)
		return "failed", err.Error()
	}
	model.DB.Create(&log)
	return "sent", to
}

// SendInvoiceReminderOne sends a reminder for a single invoice on demand.
// Pass {"force":true} to bypass the once-per-day guard.
func SendInvoiceReminderOne(c fiber.Ctx) error {
	id := c.Params("id")
	// Accept force as bool or string: the admin form sends select values as
	// strings ("true"), while an API caller would send a real boolean.
	var in struct {
		Force any `json:"force"`
	}
	_ = c.Bind().JSON(&in)
	force := false
	switch v := in.Force.(type) {
	case bool:
		force = v
	case string:
		force = v == "true" || v == "1"
	}

	var inv model.Invoice
	if err := model.DB.First(&inv, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	result, detail := sendReminderFor(inv, time.Now(), force)
	switch result {
	case "sent":
		return c.JSON(fiber.Map{"status": "sent", "to": detail})
	case "failed":
		return c.Status(502).JSON(fiber.Map{"error": "gagal mengirim email", "detail": detail})
	default:
		return c.Status(409).JSON(fiber.Map{"error": detail})
	}
}

// SendInvoiceRemindersDue emails every invoice that needs chasing in one run.
//
// Selection is deliberate rather than "everything unpaid": clients are contacted
// when a reminder is actually useful — shortly before due date, and then on a
// widening cadence after it — so the mail does not become noise they ignore.
func SendInvoiceRemindersDue(c fiber.Ctx) error {
	now := time.Now()

	var items []model.Invoice
	if err := model.DB.
		Where("status <> ? AND status <> ?", "paid", "draft").
		Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	type row struct {
		Invoice string `json:"invoice"`
		Result  string `json:"result"`
		Detail  string `json:"detail"`
	}
	out := []row{}
	sent, skipped, failed := 0, 0, 0

	for _, inv := range items {
		if inv.Outstanding() == 0 || inv.DueDate == nil {
			continue
		}
		due := time.Date(inv.DueDate.Year(), inv.DueDate.Month(), inv.DueDate.Day(), 0, 0, 0, 0, now.Location())
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		diff := int(today.Sub(due).Hours() / 24) // >0 = overdue, <0 = still upcoming

		// Cadence: 3 days before due, on the due date, then day 1, 3, 7, 14, and
		// every 14 days after. Anything else is left alone for today.
		due3 := diff == -3
		onDue := diff == 0
		early := diff == 1 || diff == 3 || diff == 7 || diff == 14
		recurring := diff > 14 && diff%14 == 0
		if !(due3 || onDue || early || recurring) {
			continue
		}

		result, detail := sendReminderFor(inv, now, false)
		switch result {
		case "sent":
			sent++
		case "failed":
			failed++
		default:
			skipped++
		}
		out = append(out, row{Invoice: inv.InvoiceNumber, Result: result, Detail: detail})
	}

	if sent > 0 {
		model.DB.Create(&model.Notification{
			TenantID: "logikraf",
			Type:     "invoice_reminders_sent",
			Title:    "Pengingat Tagihan Terkirim",
			Message:  strconv.Itoa(sent) + " pengingat tagihan dikirim ke klien.",
			RefTable: "invoices",
			IsRead:   true,
		})
	}

	return c.JSON(fiber.Map{
		"checked": len(items),
		"sent":    sent,
		"skipped": skipped,
		"failed":  failed,
		"details": out,
	})
}

// GetInvoiceReminders returns the reminder history for one invoice.
func GetInvoiceReminders(c fiber.Ctx) error {
	id := c.Params("id")
	var logs []model.InvoiceReminder
	if err := model.DB.Where("invoice_id = ?", id).
		Order("created_at desc").Find(&logs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(logs)
}
