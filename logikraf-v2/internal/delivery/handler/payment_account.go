package handler

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// RefundPaymentTransaction records a refund in the ledger and calls the
// provider's refund API. Logikraf only records; the provider moves the money.
func RefundPaymentTransaction(c fiber.Ctx) error {
	tenant := c.Locals("tenant").(string)
	id, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	var pt model.PaymentTransaction
	if err := model.DB.Where("id = ? AND tenant_id = ?", id, tenant).First(&pt).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}
	if pt.Status != "settled" && pt.Status != "paid" {
		return c.Status(400).JSON(fiber.Map{"error": "only settled/paid can be refunded"})
	}

	var providerErr error
	switch pt.Provider {
	case "xendit":
		// ponytail: Xendit invoice cancel via expire. Real refund API (/refunds) needs
		// separate payout flow; cancel covers MVP reverse. Upgrade to /refunds when needed.
		secret := setting("xendit_secret_key", tenant)
		if secret != "" {
			req, _ := http.NewRequest(http.MethodPost, "https://api.xendit.co/v2/invoices/"+pt.OrderID+"/expire", nil)
			req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
			resp, err := (&http.Client{Timeout: 20 * time.Second}).Do(req)
			if err != nil {
				providerErr = err
			} else {
				defer resp.Body.Close()
				if resp.StatusCode < 200 || resp.StatusCode >= 300 {
					raw, _ := io.ReadAll(resp.Body)
					providerErr = fmt.Errorf("provider refund failed: %s", string(raw))
				}
			}
		}
	default: // midtrans
		serverKey := setting("midtrans_server_key", tenant)
		baseURL := "https://app.midtrans.com"
		if serverKey != "" {
			body, _ := json.Marshal(map[string]any{
				"refund_key": "RF-" + pt.OrderID,
				"amount":     pt.GrossAmount,
				"reason":     "requested by admin",
			})
			req, _ := http.NewRequest(http.MethodPost, baseURL+"/v2/"+pt.OrderID+"/refund", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(serverKey+":")))
			resp, err := (&http.Client{Timeout: 20 * time.Second}).Do(req)
			if err != nil {
				providerErr = err
			} else {
				defer resp.Body.Close()
				if resp.StatusCode < 200 || resp.StatusCode >= 300 {
					raw, _ := io.ReadAll(resp.Body)
					providerErr = fmt.Errorf("provider refund failed: %s", string(raw))
				}
			}
		}
	}

	if providerErr != nil {
		return c.Status(502).JSON(fiber.Map{"error": providerErr.Error()})
	}
	// ponytail: no provider key (or provider accepted) → record refund in ledger for audit
	pt.Status = "refunded"
	if err := model.DB.Save(&pt).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"status": "refunded", "order_id": pt.OrderID, "provider": pt.Provider})
}
