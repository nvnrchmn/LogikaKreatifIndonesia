package handler

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"golang.org/x/crypto/bcrypt"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// PartnerStoreView — client store + status XenPlatform + akun portal mitra.
type PartnerStoreView struct {
	ID           uint             `json:"id"`
	Slug         string           `json:"slug"`
	Name         string           `json:"name"`
	IsActive     bool             `json:"is_active"`
	SubAccountID string           `json:"sub_account_id"`
	EntityType   string           `json:"entity_type"`
	KYCStatus    string           `json:"kyc_status"`
	FeePct       float64          `json:"fee_pct"`
	PartnerUser  *PartnerUserView `json:"partner_user,omitempty"`
}

type PartnerUserView struct {
	ID             uint    `json:"id"`
	Email          string  `json:"email"`
	WAPhone        string  `json:"wa_phone,omitempty"`
	Active         bool    `json:"active"`
	MustChangePass bool    `json:"must_change_pass"`
	LastLoginAt    *string `json:"last_login_at,omitempty"`
}

// GET /api/admin/client-stores/partners
func ListPartnerStoresAdmin(c fiber.Ctx) error {
	var stores []model.ClientStore
	if err := model.DB.Order("id ASC").Find(&stores).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal memuat store")
	}
	var users []model.PartnerUser
	if err := model.DB.Find(&users).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal memuat akun portal")
	}
	userByStore := map[uint]model.PartnerUser{}
	for _, u := range users {
		if _, ok := userByStore[u.ClientStoreID]; !ok {
			userByStore[u.ClientStoreID] = u
		}
	}
	out := []PartnerStoreView{}
	for _, s := range stores {
		v := PartnerStoreView{
			ID: s.ID, Slug: s.Slug, Name: s.Name, IsActive: s.IsActive,
			SubAccountID: s.SubAccountID, EntityType: s.EntityType, KYCStatus: s.KYCStatus,
			FeePct: s.FeePct,
		}
		if u, ok := userByStore[s.ID]; ok {
			p := PartnerUserView{ID: u.ID, Email: u.Email, WAPhone: u.WAPhone, Active: u.Active, MustChangePass: u.MustChangePass}
			if u.LastLoginAt != nil {
				t := u.LastLoginAt.Format("2006-01-02 15:04")
				p.LastLoginAt = &t
			}
			v.PartnerUser = &p
		}
		out = append(out, v)
	}
	return c.JSON(fiber.Map{"data": out})
}

// POST /api/admin/client-stores/:id/partner-user — buat/update akun login portal mitra
func UpsertPartnerUserAdmin(c fiber.Ctx) error {
	storeID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "id store tidak valid")
	}
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		WAPhone  string `json:"wa_phone"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	body.Email = strings.TrimSpace(body.Email)
	if body.Email == "" || body.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email & password wajib diisi")
	}
	if len(body.Password) < 8 {
		return fiber.NewError(fiber.StatusBadRequest, "password minimal 8 karakter")
	}
	var store model.ClientStore
	if err := model.DB.First(&store, storeID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "store tidak ditemukan")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal hash password")
	}
	var u model.PartnerUser
	err = model.DB.Where("client_store_id = ?", storeID).First(&u).Error
	if err == nil {
		// update akun existing (ganti password → wajib ganti lagi)
		u.Email = body.Email
		u.PasswordHash = string(hash)
		u.MustChangePass = true
		u.Active = true
		if body.WAPhone != "" {
			u.WAPhone = body.WAPhone
		}
		if err := model.DB.Save(&u).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "gagal menyimpan akun")
		}
	} else {
		u = model.PartnerUser{
			ClientStoreID: uint(storeID), Email: body.Email, PasswordHash: string(hash),
			MustChangePass: true, Active: true, WAPhone: body.WAPhone,
		}
		if err := model.DB.Create(&u).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat akun")
		}
	}
	return c.JSON(fiber.Map{"ok": true, "email": u.Email})
}

// XenAccount — ringkasan Managed sub-account dari Xendit (GET /v2/accounts)
type XenAccount struct {
	ID           string `json:"id"`
	Email        string `json:"email"`
	Status       string `json:"status"`
	BusinessName string `json:"business_name"`
	Created      string `json:"created"`
}

// GET /api/admin/xenplatform/accounts — daftar Managed sub-account dari Xendit (utk sinkron)
func ListXenplatformAccountsAdmin(c fiber.Ctx) error {
	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}
	req, err := http.NewRequest(http.MethodGet, "https://api.xendit.co/v2/accounts?type=MANAGED&limit=50", nil)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi Xendit")
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		msg := strings.TrimSpace(string(body))
		if len(msg) > 200 {
			msg = msg[:200]
		}
		return c.Status(resp.StatusCode).JSON(fiber.Map{"error": "Xendit: " + msg})
	}
	var parsed struct {
		Data []struct {
			ID            string `json:"id"`
			Email         string `json:"email"`
			Status        string `json:"status"`
			PublicProfile struct {
				BusinessName string `json:"business_name"`
			} `json:"public_profile"`
			Created string `json:"created"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "respons Xendit tidak valid")
	}
	out := []XenAccount{}
	for _, a := range parsed.Data {
		out = append(out, XenAccount{
			ID: a.ID, Email: a.Email, Status: a.Status,
			BusinessName: a.PublicProfile.BusinessName, Created: a.Created,
		})
	}
	return c.JSON(fiber.Map{"data": out})
}

// PATCH /api/admin/client-stores/:id/xenplatform — set data XenPlatform sub-account
func UpdateXenplatformAdmin(c fiber.Ctx) error {
	storeID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "id store tidak valid")
	}
	var body struct {
		SubAccountID *string `json:"sub_account_id"`
		EntityType   *string `json:"entity_type"`
		KYCStatus    *string `json:"kyc_status"`
	}
	if err := c.Bind().Body(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	var store model.ClientStore
	if err := model.DB.First(&store, storeID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "store tidak ditemukan")
	}
	if body.SubAccountID != nil {
		store.SubAccountID = strings.TrimSpace(*body.SubAccountID)
	}
	if body.EntityType != nil {
		store.EntityType = strings.ToUpper(strings.TrimSpace(*body.EntityType))
	}
	if body.KYCStatus != nil {
		store.KYCStatus = strings.ToUpper(strings.TrimSpace(*body.KYCStatus))
	}
	if err := model.DB.Save(&store).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal menyimpan")
	}
	return c.JSON(fiber.Map{"ok": true})
}
