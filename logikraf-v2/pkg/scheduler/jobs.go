package scheduler

import (
	"context"
	"strconv"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"gorm.io/gorm"
)

type Job interface {
	Key() string
	Schedule() string
	Run(ctx context.Context, db *gorm.DB) error
}

// InvoiceReminderJob sends reminder emails whose cadence falls today.
type InvoiceReminderJob struct{}

func (InvoiceReminderJob) Key() string      { return "invoice_reminders" }
func (InvoiceReminderJob) Schedule() string { return "0 9 * * *" }

func (InvoiceReminderJob) Run(ctx context.Context, db *gorm.DB) error {
	return RunReminderSend(ctx, db)
}

// InvoiceStatusRefreshJob ages overdue invoices from sent -> overdue.
type InvoiceStatusRefreshJob struct{}

func (InvoiceStatusRefreshJob) Key() string      { return "invoice_status_refresh" }
func (InvoiceStatusRefreshJob) Schedule() string { return "0 8 * * *" }

func (InvoiceStatusRefreshJob) Run(ctx context.Context, db *gorm.DB) error {
	return RunStatusRefresh(ctx, db)
}

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

// RunStatusRefresh marks issued invoices past their due date as overdue.
func RunStatusRefresh(ctx context.Context, db *gorm.DB) error {
	type invoice struct {
		ID         uint
		Status     string
		DueDate    *time.Time
		PaidAmount uint
		Total      uint
	}
	var items []invoice
	if err := db.Find(&items).Error; err != nil {
		return err
	}
	now := time.Now()
	for _, inv := range items {
		if inv.Status == "draft" || inv.Status == "paid" {
			continue
		}
		next := inv.Status
		if inv.Total > 0 && inv.PaidAmount >= inv.Total {
			next = "paid"
		} else if inv.PaidAmount > 0 {
			next = "partial"
		} else if inv.DueDate != nil && now.After(*inv.DueDate) {
			next = "overdue"
		}
		if next != inv.Status {
			db.Model(&model.Invoice{}).Where("id = ?", inv.ID).Update("status", next)
		}
	}
	return nil
}

// RunReminderSend selects invoices whose cadence falls today and emails them.
func RunReminderSend(ctx context.Context, db *gorm.DB) error {
	type invoice struct {
		ID            uint
		InvoiceNumber string
		Total         uint
		PaidAmount    uint
		Status        string
		DueDate       *time.Time
		OrderID       *uint
	}
	var items []invoice
	if err := db.Where("status <> ? AND status <> ?", "paid", "draft").Find(&items).Error; err != nil {
		return err
	}
	now := time.Now()
	for _, inv := range items {
		if inv.Total > 0 && inv.PaidAmount >= inv.Total {
			continue
		}
		if inv.DueDate == nil {
			continue
		}
		due := time.Date(inv.DueDate.Year(), inv.DueDate.Month(), inv.DueDate.Day(), 0, 0, 0, 0, now.Location())
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		diff := int(today.Sub(due).Hours() / 24)
		due3 := diff == -3
		onDue := diff == 0
		early := diff == 1 || diff == 3 || diff == 7 || diff == 14
		recurring := diff > 14 && diff%14 == 0
		if !(due3 || onDue || early || recurring) {
			continue
		}

		var order model.Order
		if inv.OrderID == nil || db.First(&order, *inv.OrderID).Error != nil {
			continue
		}
		var client model.Client
		if db.First(&client, order.ClientID).Error != nil {
			continue
		}
		emailAddr := client.Email
		if emailAddr == "" {
			continue
		}
		name := client.PICName
		if name == "" {
			name = client.CompanyName
		}

		dueStr := inv.DueDate.Format("02-01-2006")
		var daysOverdue int
		if diff > 0 {
			daysOverdue = diff
		}

		outstanding := inv.Total - inv.PaidAmount
		if inv.PaidAmount >= inv.Total {
			outstanding = 0
		}

		cfg := email.DefaultConfig()
		err := email.SendInvoiceReminder(
			cfg, emailAddr, name, inv.InvoiceNumber,
			thousands(outstanding), thousands(inv.Total), thousands(inv.PaidAmount),
			dueStr, daysOverdue,
		)

		status := "sent"
		errMsg := ""
		if err != nil {
			status = "failed"
			errMsg = err.Error()
		}
		db.Create(&model.InvoiceReminder{
			InvoiceID:    inv.ID,
			SentTo:      emailAddr,
			DaysOverdue:  daysOverdue,
			Outstanding:  outstanding,
			Status:       status,
			ErrorMessage: errMsg,
			CreatedAt:    now,
		})
	}
	return nil
}
