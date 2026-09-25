package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// CreateXenplatformAccountAdmin — POST /api/admin/xenplatform/accounts
// Membuat sub-account XenPlatform via POST /v3/accounts (endpoint resmi; v2 legacy).
// Body v3: { name, email, identity: { country_of_incorporation, entity_type },
//
//	configuration: { users.send_email_invite, webhooks.recipient } }.
//
// Verify-on-behalf aktif untuk xenPlatform Logikraf → KYC disubmit lewat API,
// jadi tidak mengirim undangan email (send_email_invite=false).
func CreateXenplatformAccountAdmin(c fiber.Ctx) error {
	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}
	var body struct {
		Name         string `json:"name"`
		Email        string `json:"email"`
		BusinessName string `json:"business_name"` // fallback untuk name
		EntityType   string `json:"entity_type"`   // INDIVIDUAL | CORPORATION | SOLE_PROPRIETORSHIP | ...
		Type         string `json:"type"`          // warisan v2 (tidak dipakai di v3)
		Country      string `json:"country"`       // ISO 3166-1 Alpha-2, default ID
		StoreID      *uint  `json:"store_id"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	body.Email = strings.TrimSpace(body.Email)
	name := firstNonEmpty(body.Name, body.BusinessName)
	if name == "" || body.Email == "" {
		return fiber.NewError(fiber.StatusBadRequest, "name/business_name dan email wajib diisi")
	}

	// Pada Test key, v3 hanya mengizinkan CORPORATION — atur XENDIT_ACCOUNTS_ENTITY_TYPE.
	country := strings.ToUpper(firstNonEmpty(body.Country, os.Getenv("XENDIT_ACCOUNT_COUNTRY"), "ID"))
	entity := strings.ToUpper(firstNonEmpty(body.EntityType, os.Getenv("XENDIT_ACCOUNTS_ENTITY_TYPE"), "INDIVIDUAL"))

	payload := map[string]any{
		"name":  name,
		"email": body.Email,
		"identity": map[string]any{
			"country_of_incorporation": country,
			"entity_type":              entity,
		},
		"configuration": map[string]any{
			"users":    map[string]any{"send_email_invite": false},
			"webhooks": map[string]any{"recipient": firstNonEmpty(os.Getenv("XENDIT_WEBHOOK_RECIPIENT"), "MASTER_ACCOUNT")},
		},
	}
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/v3/accounts", bytes.NewReader(bodyBytes))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", xenditPlatformAuth(secret))
	req.Header.Set("Content-Type", "application/json")
	resp, err := partnerHTTP.Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi Xendit")
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return xenditError(c, resp.StatusCode, respBody)
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
