package handler

import (
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

// GetOrderByID returns a single order with its linked project, invoices and transactions.
func GetOrderByID(c fiber.Ctx) error {
	id := c.Params("id")
	var order model.Order
	if err := model.DB.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	var project model.Project
	model.DB.Where("order_id = ?", order.ID).First(&project)

	var invoices []model.Invoice
	model.DB.Where("order_id = ?", order.ID).Order("created_at desc").Find(&invoices)

	var transactions []model.Transaction
	model.DB.Where("order_id = ?", order.ID).Order("created_at desc").Find(&transactions)

	var client model.Client
	model.DB.First(&client, order.ClientID)

	return c.JSON(fiber.Map{
		"order":        order,
		"project":      project,
		"invoices":     invoices,
		"transactions": transactions,
		"client":       client,
	})
}

// projectStatusTransitions maps each status to the statuses it may move into.
var projectStatusTransitions = map[string][]string{
	"planning":    {"in_progress", "cancelled"},
	"in_progress": {"review", "on_hold", "cancelled"},
	"review":      {"in_progress", "completed"},
	"on_hold":     {"in_progress", "cancelled"},
	"completed":   {},
	"cancelled":   {},
}

// UpdateProjectStatus moves a project to a new status, enforcing legal transitions.
func UpdateProjectStatus(c fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Status == "" {
		return c.Status(400).JSON(fiber.Map{"error": "status required"})
	}

	var project model.Project
	if err := model.DB.First(&project, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	allowed, known := projectStatusTransitions[project.Status]
	if !known {
		// Legacy/unknown current status: allow moving into any valid status.
		if _, ok := projectStatusTransitions[in.Status]; !ok {
			return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
		}
	} else {
		ok := false
		for _, s := range allowed {
			if s == in.Status {
				ok = true
				break
			}
		}
		if !ok {
			return c.Status(409).JSON(fiber.Map{
				"error":   "illegal transition",
				"from":    project.Status,
				"allowed": allowed,
			})
		}
	}

	prev := project.Status
	project.Status = in.Status

	now := time.Now()
	if in.Status == "in_progress" && project.StartDate == nil {
		project.StartDate = &now
	}

	if err := model.DB.Save(&project).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	// Audit trail as a notification so the change is visible in the admin panel.
	msg := "Project \"" + project.Name + "\" berubah dari " + prev + " ke " + in.Status
	if in.Note != "" {
		msg += ". Catatan: " + in.Note
	}
	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "project_status_changed",
		Title:    "Status Project Diperbarui",
		Message:  msg,
		RefTable: "projects",
		RefID:    project.ID,
		IsRead:   true,
	})

	return c.JSON(project)
}

// GetProjectStatusOptions returns the legal next statuses for a project.
func GetProjectStatusOptions(c fiber.Ctx) error {
	id := c.Params("id")
	var project model.Project
	if err := model.DB.First(&project, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	allowed, ok := projectStatusTransitions[project.Status]
	if !ok {
		allowed = []string{"planning", "in_progress", "review", "on_hold", "completed", "cancelled"}
	}
	return c.JSON(fiber.Map{
		"current": project.Status,
		"allowed": allowed,
	})
}

// ConvertLeadToClient promotes a lead into a client record and closes the lead.
func ConvertLeadToClient(c fiber.Ctx) error {
	id := c.Params("id")
	var lead model.Lead
	if err := model.DB.First(&lead, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	if lead.Status == "converted" {
		return c.Status(409).JSON(fiber.Map{"error": "lead already converted"})
	}

	// Reuse an existing client with the same email instead of duplicating.
	var client model.Client
	if err := model.DB.Where("email = ?", lead.Email).First(&client).Error; err != nil {
		client = model.Client{
			PICName:     lead.Name,
			Email:       lead.Email,
			CompanyName: lead.Company,
		}
		if err := model.DB.Create(&client).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to create client"})
		}
	}

	lead.Status = "converted"
	if err := model.DB.Save(&lead).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to update lead"})
	}

	return c.Status(201).JSON(fiber.Map{
		"client": client,
		"lead":   lead,
	})
}

// orderStatusTransitions maps each order status to the statuses it may move into.
// "paid" is included because the iPaymu webhook writes it directly on settlement,
// so it is a real state the admin panel has to be able to move out of.
var orderStatusTransitions = map[string][]string{
	"pending":   {"paid", "cancelled"},
	"paid":      {"active", "refunded", "cancelled"},
	"active":    {"completed", "on_hold", "cancelled"},
	"on_hold":   {"active", "cancelled"},
	"completed": {},
	"cancelled": {},
	"refunded":  {},
}

// GetOrderStatusOptions returns the legal next statuses for an order.
func GetOrderStatusOptions(c fiber.Ctx) error {
	id := c.Params("id")
	var order model.Order
	if err := model.DB.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	allowed, ok := orderStatusTransitions[order.Status]
	if !ok {
		allowed = []string{"pending", "paid", "active", "on_hold", "completed", "cancelled", "refunded"}
	}
	return c.JSON(fiber.Map{"current": order.Status, "allowed": allowed})
}

// UpdateOrderStatus moves an order to a new status, enforcing legal transitions,
// and keeps the linked project in step when the order becomes active or ends.
func UpdateOrderStatus(c fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		Status    string `json:"status"`
		Milestone string `json:"milestone_status"`
		Note      string `json:"note"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Status == "" {
		return c.Status(400).JSON(fiber.Map{"error": "status required"})
	}

	var order model.Order
	if err := model.DB.First(&order, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	allowed, known := orderStatusTransitions[order.Status]
	if !known {
		if _, ok := orderStatusTransitions[in.Status]; !ok {
			return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
		}
	} else {
		ok := false
		for _, s := range allowed {
			if s == in.Status {
				ok = true
				break
			}
		}
		if !ok {
			return c.Status(409).JSON(fiber.Map{
				"error":   "illegal transition",
				"from":    order.Status,
				"allowed": allowed,
			})
		}
	}

	prev := order.Status
	order.Status = in.Status
	if in.Milestone != "" {
		order.MilestoneStatus = in.Milestone
	}
	if err := model.DB.Save(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	// Keep the linked project consistent with the order lifecycle so the two
	// modules cannot drift apart (an active order with a project still in planning).
	var project model.Project
	if err := model.DB.Where("order_id = ?", order.ID).First(&project).Error; err == nil {
		now := time.Now()
		switch in.Status {
		case "active":
			if project.Status == "planning" {
				project.Status = "in_progress"
				if project.StartDate == nil {
					project.StartDate = &now
				}
				model.DB.Save(&project)
			}
		case "cancelled":
			if project.Status != "completed" {
				project.Status = "cancelled"
				model.DB.Save(&project)
			}
		}
	}

	msg := "Order " + order.OrderNumber + " berubah dari " + prev + " ke " + in.Status
	if in.Note != "" {
		msg += ". Catatan: " + in.Note
	}
	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "order_status_changed",
		Title:    "Status Order Diperbarui",
		Message:  msg,
		RefTable: "orders",
		RefID:    order.ID,
		IsRead:   true,
	})

	return c.JSON(order)
}

// ticketStatusTransitions maps each ticket status to the statuses it may move into.
// Closed is not terminal: a reopened complaint is a normal support case.
var ticketStatusTransitions = map[string][]string{
	"open":    {"pending", "closed"},
	"pending": {"open", "closed"},
	"closed":  {"open"},
}

// GetTicketStatusOptions returns the legal next statuses for a ticket.
func GetTicketStatusOptions(c fiber.Ctx) error {
	id := c.Params("id")
	var ticket model.Ticket
	if err := model.DB.First(&ticket, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	allowed, ok := ticketStatusTransitions[ticket.Status]
	if !ok {
		allowed = []string{"open", "pending", "closed"}
	}
	return c.JSON(fiber.Map{"current": ticket.Status, "allowed": allowed})
}

// UpdateTicketStatus moves a ticket to a new status, enforcing legal transitions.
func UpdateTicketStatus(c fiber.Ctx) error {
	id := c.Params("id")
	var in struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}
	if err := c.Bind().JSON(&in); err != nil || in.Status == "" {
		return c.Status(400).JSON(fiber.Map{"error": "status required"})
	}

	var ticket model.Ticket
	if err := model.DB.First(&ticket, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	allowed, known := ticketStatusTransitions[ticket.Status]
	if !known {
		if _, ok := ticketStatusTransitions[in.Status]; !ok {
			return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
		}
	} else {
		ok := false
		for _, s := range allowed {
			if s == in.Status {
				ok = true
				break
			}
		}
		if !ok {
			return c.Status(409).JSON(fiber.Map{
				"error":   "illegal transition",
				"from":    ticket.Status,
				"allowed": allowed,
			})
		}
	}

	prev := ticket.Status
	ticket.Status = in.Status
	if err := model.DB.Save(&ticket).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	msg := "Tiket \"" + ticket.Subject + "\" berubah dari " + prev + " ke " + in.Status
	if in.Note != "" {
		msg += ". Catatan: " + in.Note
	}
	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "ticket_status_changed",
		Title:    "Status Tiket Diperbarui",
		Message:  msg,
		RefTable: "tickets",
		RefID:    ticket.ID,
		IsRead:   true,
	})

	return c.JSON(ticket)
}
