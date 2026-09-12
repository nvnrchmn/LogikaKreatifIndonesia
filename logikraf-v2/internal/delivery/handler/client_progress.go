package handler

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

type terminRow struct {
	Name   string `json:"name"`
	Amount uint   `json:"amount"`
	Status string `json:"status"`
	PaidAt string `json:"paid_at"`
}

type progressInvoice struct {
	ID      uint   `json:"id"`
	Number  string `json:"invoice_number"`
	Status  string `json:"status"`
	Total   uint   `json:"total"`
	Paid    uint   `json:"paid_amount"`
	DueDate string `json:"due_at"`
}

type progressProject struct {
	ID          uint              `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Status      string            `json:"status"`
	Stage       int               `json:"stage"`
	StartDate   string            `json:"start_date"`
	Deadline    string            `json:"deadline"`
	LiveURL     string            `json:"live_url"`
	OrderNumber string            `json:"order_number"`
	OrderTotal  uint              `json:"order_total"`
	OrderPaid   uint              `json:"order_paid"`
	Note        string            `json:"note"`
	Termins     []terminRow       `json:"termins"`
	Invoices    []progressInvoice `json:"invoices"`
}

// stageOf — posisi tahap pada linimasa (0 planning, 1 in_progress, 2 review,
// 3 completed); -1 bila on_hold/cancelled (di luar alur normal).
func stageOf(status string) int {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "planning", "":
		return 0
	case "in_progress":
		return 1
	case "review":
		return 2
	case "completed", "done":
		return 3
	}
	return -1
}

func fmtDay(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format("02 Jan 2006")
}

// ClientProgress — linimasa progres proyek milik klien: tahap pengerjaan,
// termin pembayaran, dan invoice terkait. Semua ter-scope ke klien yang login.
func ClientProgress(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "akun belum tertaut ke data klien"})
	}

	var projects []model.Project
	model.DB.Where("client_id = ?", cid).Order("sort_order asc, created_at desc").Find(&projects)

	var orders []model.Order
	model.DB.Where("client_id = ?", cid).Find(&orders)
	orderByID := map[uint]model.Order{}
	ids := make([]uint, 0, len(orders))
	for _, o := range orders {
		orderByID[o.ID] = o
		ids = append(ids, o.ID)
	}

	terminByOrder := map[uint][]terminRow{}
	paidByOrder := map[uint]uint{}
	if len(ids) > 0 {
		var txs []model.Transaction
		model.DB.Where("order_id IN ?", ids).Order("created_at asc").Find(&txs)
		for _, tx := range txs {
			name := strings.TrimSpace(tx.MilestoneName)
			if name == "" {
				name = tx.TransactionReference
			}
			terminByOrder[tx.OrderID] = append(terminByOrder[tx.OrderID], terminRow{
				Name:   name,
				Amount: tx.Amount,
				Status: tx.Status,
				PaidAt: fmtDay(tx.SettledAt),
			})
			if strings.EqualFold(tx.Status, "settled") || strings.EqualFold(tx.Status, "paid") {
				paidByOrder[tx.OrderID] += tx.Amount
			}
		}
	}

	invByOrder := map[uint][]progressInvoice{}
	if len(ids) > 0 {
		var invs []model.Invoice
		model.DB.Where("order_id IN ?", ids).Order("created_at asc").Find(&invs)
		for _, iv := range invs {
			if iv.OrderID == nil {
				continue
			}
			invByOrder[*iv.OrderID] = append(invByOrder[*iv.OrderID], progressInvoice{
				ID:      iv.ID,
				Number:  iv.InvoiceNumber,
				Status:  iv.Status,
				Total:   iv.Total,
				Paid:    iv.PaidAmount,
				DueDate: fmtDay(iv.DueDate),
			})
		}
	}

	out := make([]progressProject, 0, len(projects))
	for _, p := range projects {
		row := progressProject{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Status:      p.Status,
			Stage:       stageOf(p.Status),
			StartDate:   fmtDay(p.StartDate),
			Deadline:    fmtDay(p.Deadline),
			LiveURL:     p.LiveURL,
			Termins:     []terminRow{},
			Invoices:    []progressInvoice{},
		}
		if o, ok := orderByID[p.OrderID]; ok && p.OrderID != 0 {
			row.OrderNumber = o.OrderNumber
			row.OrderTotal = o.TotalAmount
			row.OrderPaid = paidByOrder[o.ID]
			row.Note = o.MilestoneStatus
			row.Termins = terminByOrder[o.ID]
			row.Invoices = invByOrder[o.ID]
		}
		out = append(out, row)
	}

	return c.JSON(fiber.Map{"projects": out, "total": len(out)})
}
