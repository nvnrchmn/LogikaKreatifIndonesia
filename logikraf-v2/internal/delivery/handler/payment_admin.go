package handler

import (
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

// GetPaymentTransactions returns all payment transactions for admin panel.
func GetPaymentTransactions(c fiber.Ctx) error {
	var items []model.PaymentTransaction
	query := model.DB.Order("created_at desc")

	// Optional filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if provider := c.Query("provider"); provider != "" {
		query = query.Where("provider = ?", provider)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("client_name LIKE ? OR client_email LIKE ? OR order_id LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(items)
}

// GetPaymentTransaction returns a single payment transaction by ID.
func GetPaymentTransaction(c fiber.Ctx) error {
	id := c.Params("id")
	var pt model.PaymentTransaction
	if err := model.DB.First(&pt, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	return c.JSON(pt)
}

// SettlePaymentTransaction marks a payment transaction as settled (manual settlement).
func SettlePaymentTransaction(c fiber.Ctx) error {
	id := c.Params("id")
	var pt model.PaymentTransaction
	if err := model.DB.First(&pt, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	now := time.Now()
	pt.Status = "settled"
	pt.SettledAt = &now
	pt.PaidAt = &now
	if err := model.DB.Save(&pt).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(pt)
}

// GetPaymentLedger returns the payment ledger for reconciliation.
// Aggregates transactions by status, provider, and date.
func GetPaymentLedger(c fiber.Ctx) error {
	var results []struct {
		Date        string `json:"date"`
		Provider    string `json:"provider"`
		Status      string `json:"status"`
		Count       int    `json:"count"`
		GrossAmount uint   `json:"gross_amount"`
		ProviderFee uint   `json:"provider_fee"`
		PlatformFee uint   `json:"platform_fee"`
		NetAmount   uint   `json:"net_amount"`
	}

	if err := model.DB.Model(&model.PaymentTransaction{}).
		Select("DATE(created_at) as date, provider, status, COUNT(*) as count, SUM(gross_amount) as gross_amount, SUM(provider_fee) as provider_fee, SUM(platform_fee) as platform_fee, SUM(net_amount) as net_amount").
		Group("DATE(created_at), provider, status").
		Order("date desc").
		Scan(&results).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}

	return c.JSON(results)
}

// GetPaymentSummary returns payment summary totals for dashboard.
func GetPaymentSummary(c fiber.Ctx) error {
	type resultType struct {
		TotalTransactions int  `json:"total_transactions"`
		PendingCount      int  `json:"pending_count"`
		SettledCount      int  `json:"settled_count"`
		FailedCount       int  `json:"failed_count"`
		TotalGross        uint `json:"total_gross"`
		TotalNet          uint `json:"total_net"`
		TotalProviderFee  uint `json:"total_provider_fee"`
		TotalPlatformFee  uint `json:"total_platform_fee"`
	}
	var result resultType

	row := model.DB.Model(&model.PaymentTransaction{}).
		Select(`COUNT(*) as total_transactions,
			COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
			COALESCE(SUM(CASE WHEN status = 'settled' THEN 1 ELSE 0 END), 0) as settled_count,
			COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) as failed_count,
			COALESCE(SUM(gross_amount), 0) as total_gross,
			COALESCE(SUM(net_amount), 0) as total_net,
			COALESCE(SUM(provider_fee), 0) as total_provider_fee,
			COALESCE(SUM(platform_fee), 0) as total_platform_fee`).
		Row()
	row.Scan(&result.TotalTransactions, &result.PendingCount, &result.SettledCount, &result.FailedCount,
		&result.TotalGross, &result.TotalNet, &result.TotalProviderFee, &result.TotalPlatformFee)

	return c.JSON(result)
}

// CreateClientFromPayment creates a client from a payment transaction.
func CreateClientFromPayment(c fiber.Ctx) error {
	id := c.Params("id")
	var pt model.PaymentTransaction
	if err := model.DB.First(&pt, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	// Check if client already exists with this email
	var existing model.Client
	if err := model.DB.Where("email = ?", pt.ClientEmail).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "client already exists", "client_id": existing.ID})
	}

	client := model.Client{
		PICName:     pt.ClientName,
		Email:       pt.ClientEmail,
		Phone:       pt.ClientPhone,
		CompanyName: pt.ClientName,
	}

	if err := model.DB.Create(&client).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create client"})
	}

	return c.Status(201).JSON(client)
}

// CreateOrderFromPayment creates an order from a payment transaction.
func CreateOrderFromPayment(c fiber.Ctx) error {
	id := c.Params("id")
	var pt model.PaymentTransaction
	if err := model.DB.First(&pt, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	// Find or create client
	var client model.Client
	if err := model.DB.Where("email = ?", pt.ClientEmail).First(&client).Error; err != nil {
		client = model.Client{
			PICName: pt.ClientName,
			Email:   pt.ClientEmail,
			Phone:   pt.ClientPhone,
		}
		if err := model.DB.Create(&client).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to create client"})
		}
	}

	order := model.Order{
		UserID:      1, // Admin user ID — ideally from c.Locals("user_id")
		OrderNumber: pt.OrderID,
		ProjectName: pt.InvoiceRef,
		TotalAmount: pt.GrossAmount,
		ClientID:    client.ID,
		Status:      "pending",
	}

	if err := model.DB.Create(&order).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create order"})
	}

	// Link order to payment transaction
	pt.OrderID = order.OrderNumber
	model.DB.Save(&pt)

	return c.Status(201).JSON(order)
}
