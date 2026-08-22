package handler

import (
	"errors"
	"strings"

	"github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// isDuplicateKey reports whether err is a MySQL/SQLite unique-constraint violation.
func isDuplicateKey(err error) bool {
	if err == nil {
		return false
	}
	var me *mysql.MySQLError
	if ok := errors.As(err, &me); ok {
		return me.Number == 1062
	}
	return strings.Contains(strings.ToLower(err.Error()), "unique constraint")
}

// clientIDForUser resolves the Client record linked to the authenticated user.
// Admin users may not have a linked client; client users must have one.
func clientIDForUser(c fiber.Ctx) (uint, *model.Client, error) {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return 0, nil, fiber.ErrUnauthorized
	}
	client, err := ClientByUserID(userID)
	if err != nil {
		return 0, nil, fiber.ErrNotFound
	}
	return client.ID, client, nil
}

// ClientDashboard returns a summary for the client portal: project counts and
// recent invoices, all scoped to the logged-in client.
func ClientDashboard(c fiber.Ctx) error {
	clientID, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}

	var totalProjects, activeProjects, totalInvoices, paidInvoices int64
	model.DB.Model(&model.Project{}).Where("client_id = ?", clientID).Count(&totalProjects)
	model.DB.Model(&model.Project{}).Where("client_id = ? AND status IN ?", clientID, []string{"in_progress", "review"}).Count(&activeProjects)
	// Invoices are linked to orders; scope them through the client's orders.
	model.DB.Model(&model.Invoice{}).
		Joins("JOIN orders ON orders.id = invoices.order_id").
		Where("orders.client_id = ?", clientID).
		Count(&totalInvoices)
	model.DB.Model(&model.Invoice{}).
		Joins("JOIN orders ON orders.id = invoices.order_id").
		Where("orders.client_id = ? AND invoices.status = ?", clientID, "paid").
		Count(&paidInvoices)

	var recentInvoices []model.Invoice
	model.DB.Model(&model.Invoice{}).
		Joins("JOIN orders ON orders.id = invoices.order_id").
		Where("orders.client_id = ?", clientID).
		Order("invoices.created_at desc").Limit(5).
		Find(&recentInvoices)

	return c.JSON(fiber.Map{
		"stats": fiber.Map{
			"total_projects":  totalProjects,
			"active_projects": activeProjects,
			"total_invoices":  totalInvoices,
			"paid_invoices":   paidInvoices,
		},
		"recent_invoices": recentInvoices,
	})
}

// ClientProjects lists only the projects belonging to the logged-in client.
func ClientProjects(c fiber.Ctx) error {
	clientID, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}
	var items []model.Project
	if err := model.DB.Where("client_id = ?", clientID).Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// ClientOrders lists only the orders belonging to the logged-in client.
func ClientOrders(c fiber.Ctx) error {
	clientID, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}
	var items []model.Order
	if err := model.DB.Where("client_id = ?", clientID).Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// ClientInvoices lists only the invoices belonging to the logged-in client's orders.
func ClientInvoices(c fiber.Ctx) error {
	clientID, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client not found"})
	}
	var items []model.Invoice
	if err := model.DB.Model(&model.Invoice{}).
		Joins("JOIN orders ON orders.id = invoices.order_id").
		Where("orders.client_id = ?", clientID).
		Order("invoices.created_at desc").
		Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// ClientTickets lists tickets created by the logged-in client user.
func ClientTickets(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	var items []model.Ticket
	if err := model.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// CreateClientTicket lets a client open a support ticket scoped to their user.
func CreateClientTicket(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	var input model.Ticket
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	input.Subject = strings.TrimSpace(input.Subject)
	if input.Subject == "" {
		return c.Status(400).JSON(fiber.Map{"error": "subject required"})
	}
	validPriorities := map[string]bool{"low": true, "medium": true, "high": true}
	if !validPriorities[input.Priority] {
		input.Priority = "medium"
	}
	if input.OrderID != nil && *input.OrderID != 0 {
		clientID, _, err := clientIDForUser(c)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "client not found"})
		}
		var cnt int64
		if err := model.DB.Model(&model.Order{}).
			Where("id = ? AND client_id = ?", *input.OrderID, clientID).
			Count(&cnt).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed"})
		}
		if cnt == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "invalid order reference"})
		}
	} else {
		input.OrderID = nil
	}
	input.UserID = userID
	input.Status = "open"
	if err := model.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.Status(201).JSON(input)
}
