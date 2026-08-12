package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

// GetFinanceReport aggregates revenue/orders. ponytail: month grouping done in Go
// (portable across MariaDB/sqlite); push into SQL if the table outgrows memory.
func GetFinanceReport(c fiber.Ctx) error {
	var txs []model.Transaction
	model.DB.Where("status = ?", "settled").Find(&txs)

	var totalRevenue uint
	months := map[string]uint{}
	for _, t := range txs {
		totalRevenue += t.Amount
		d := t.CreatedAt
		if t.SettledAt != nil {
			d = *t.SettledAt
		}
		months[d.Format("2006-01")] += t.Amount
	}

	byMonth := []fiber.Map{}
	for m, amt := range months {
		byMonth = append(byMonth, fiber.Map{"month": m, "revenue": amt})
	}

	var totalOrders, pendingOrders, totalInvoices int64
	model.DB.Model(&model.Order{}).Count(&totalOrders)
	model.DB.Model(&model.Order{}).Where("status = ?", "pending").Count(&pendingOrders)
	model.DB.Model(&model.Invoice{}).Count(&totalInvoices)

	return c.JSON(fiber.Map{
		"total_revenue":  totalRevenue,
		"total_orders":   totalOrders,
		"pending_orders": pendingOrders,
		"total_invoices": totalInvoices,
		"by_month":       byMonth,
	})
}
