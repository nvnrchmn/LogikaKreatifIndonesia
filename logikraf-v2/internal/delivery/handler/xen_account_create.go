package handler

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// CreateXenplatformAccountAdmin — POST /api/admin/xenplatform/accounts
// Membuat sub-account XenPlatform baru via POST /v2/accounts (v2 API).
// Payload v2 flat: { email, type, public_profile: { business_name, country } }.
// KYC dihandle otomatis oleh Xendit via type=MANAGED (undangan email ke AR).
func CreateXenplatformAccountAdmin(c fiber.Ctx) error {
	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}
	var body struct {
		Name            string `json:"name"`
		Email           string `json:"email"`
		Type            string `json:"type"` // MANAGED | OWNED (OWNED restricted untuk Indonesia)
		BusinessName    string `json:"business_name"`
		Description     string `json:"description"`
		Country         string `json:"country"` // ISO 3166-1 Alpha-2, default ID
		StoreID         *uint  `json:"store_id"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	body.Name = strings.TrimSpace(body.Name)
	body.Email = strings.TrimSpace(body.Email)
	body.BusinessName = strings.TrimSpace(body.BusinessName)
	body.Type = strings.ToUpper(strings.TrimSpace(body.Type))
	body.Country = strings.ToUpper(strings.TrimSpace(body.Country))
	if body.Name == "" || body.Email == "" || body.BusinessName == "" {
		return fiber.NewError(fiber.StatusBadRequest, "name, email, business_name wajib diisi")
	}
	if body.Type != "MANAGED" && body.Type != "OWNED" {
		body.Type = "MANAGED"
	}
	if body.Country == "" {
		body.Country = "ID"
	}
	payload := map[string]any{
		"email": body.Email,
		"type":  body.Type,
		"public_profile": map[string]any{
			"business_name": body.BusinessName,
			"country":       body.Country,
		},
	}
	if body.Description != "" {
		payload["public_profile"].(map[string]any)["description"] = body.Description
	}
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/v2/accounts", bytes.NewReader(bodyBytes))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	req.Header.Set("Content-Type", "application/json")
	resp, err := (&http.Client{Timeout: 15 * time.Second}).Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi Xendit")
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		msg := strings.TrimSpace(string(respBody))
		if len(msg) > 200 {
			msg = msg[:200]
		}
		return c.Status(resp.StatusCode).JSON(fiber.Map{"error": "Xendit: " + msg})
	}
	var created struct {
		ID     string `json:"id"`
		Status string `json:"status"`
		Email  string `json:"email"`
	}
	if err := json.Unmarshal(respBody, &created); err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "respons Xendit tidak valid")
	}
	if body.StoreID != nil {
		var store model.ClientStore
		if err := model.DB.First(&store, *body.StoreID).Error; err == nil {
			store.SubAccountID = created.ID
			if created.Status != "" {
				store.KYCStatus = strings.ToUpper(created.Status)
			}
			_ = model.DB.Save(&store).Error
		}
	}
	return c.Status(201).JSON(fiber.Map{
		"id": created.ID, "status": created.Status, "email": created.Email,
	})
}
