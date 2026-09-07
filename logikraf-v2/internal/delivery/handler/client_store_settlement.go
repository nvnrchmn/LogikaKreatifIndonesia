package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ClientStoreSettlementView is the aggregated view shown on logikraf.id admin.
type ClientStoreSettlementView struct {
	ID          uint                 `json:"id"`
	Slug        string               `json:"slug"`
	Name        string               `json:"name"`
	BaseURL     string               `json:"base_url"`
	IsActive    bool                 `json:"is_active"`
	KeyPreview  string               `json:"key_preview"` // 8 char pertama, utk identifikasi
	Reachable   bool                 `json:"reachable"`
	Error       string               `json:"error,omitempty"`
	FetchedAt   time.Time            `json:"fetched_at"`
	Summary     *StoreFinanceSummary `json:"summary,omitempty"`
	Settlements []StoreSettlement    `json:"settlements,omitempty"`
}

// StoreFinanceSummary mirrors MysticGlide's /internal/finance/summary payload.
type StoreFinanceSummary struct {
	TotalRevenue       int64 `json:"total_revenue"`
	ProductRevenue     int64 `json:"product_revenue"`
	ShippingTotal      int64 `json:"shipping_total"`
	OrderCount         int64 `json:"order_count"`
	PaidOrderCount     int64 `json:"paid_order_count"`
	PendingRevenue     int64 `json:"pending_revenue"`
	SettledTotal       int64 `json:"settled_total"`
	PendingTotal       int64 `json:"pending_total"`
	Outstanding        int64 `json:"outstanding"`
	AvailableForPayout int64 `json:"available_for_payout"`
}

// StoreSettlement mirrors MysticGlide's Settlement JSON.
type StoreSettlement struct {
	ID         uint   `json:"id"`
	Amount     int    `json:"amount"`
	Note       string `json:"note"`
	Status     string `json:"status"`
	ResultNote string `json:"result_note"`
	ProofPath  string `json:"proof_path"`
	CreatedAt  string `json:"created_at"`
	PaidAt     string `json:"paid_at"`
}

var httpClient = &http.Client{Timeout: 6 * time.Second}

func loadClientStores() ([]model.ClientStore, error) {
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = ?", true).Order("name ASC").Find(&stores).Error; err != nil {
		return nil, err
	}
	return stores, nil
}

func storeKeyPreview(k string) string {
	if len(k) <= 8 {
		return k
	}
	return k[:8] + "…"
}

func viewFromStore(s model.ClientStore) ClientStoreSettlementView {
	return ClientStoreSettlementView{
		ID: s.ID, Slug: s.Slug, Name: s.Name, BaseURL: s.BaseURL,
		IsActive: s.IsActive, KeyPreview: storeKeyPreview(s.InternalKey),
		FetchedAt: time.Now(),
	}
}

// GetClientStoreSettlements returns every client store's finance + settlement
// snapshot, fetched live from each store's internal API.
// GET /api/client-store-settlements (admin)
func GetClientStoreSettlements(c fiber.Ctx) error {
	stores, err := loadClientStores()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	views := make([]ClientStoreSettlementView, 0, len(stores))
	for _, st := range stores {
		v := viewFromStore(st)
		if st.BaseURL == "" || st.InternalKey == "" {
			v.Error = "base_url / internal key belum diisi (edit store)"
			views = append(views, v)
			continue
		}
		sum, err := fetchStoreSummary(st.BaseURL, st.InternalKey)
		if err != nil {
			v.Error = err.Error()
			views = append(views, v)
			continue
		}
		v.Reachable = true
		v.Summary = sum
		v.Settlements, _ = fetchStoreSettlements(st.BaseURL, st.InternalKey)
		views = append(views, v)
	}
	return c.JSON(fiber.Map{"stores": views})
}

// ---- Admin CRUD client stores (UI management) ----

// ListClientStoresAdmin: GET /api/client-store-settlements/stores
func ListClientStoresAdmin(c fiber.Ctx) error {
	var stores []model.ClientStore
	if err := model.DB.Order("name ASC").Find(&stores).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	type row struct {
		ID         uint      `json:"id"`
		Slug       string    `json:"slug"`
		Name       string    `json:"name"`
		BaseURL    string    `json:"base_url"`
		IsActive   bool      `json:"is_active"`
		KeyPreview string    `json:"key_preview"`
		CreatedAt  time.Time `json:"created_at"`
	}
	rows := make([]row, 0, len(stores))
	for _, s := range stores {
		rows = append(rows, row{ID: s.ID, Slug: s.Slug, Name: s.Name, BaseURL: s.BaseURL,
			IsActive: s.IsActive, KeyPreview: storeKeyPreview(s.InternalKey), CreatedAt: s.CreatedAt})
	}
	return c.JSON(fiber.Map{"stores": rows})
}

type storeInput struct {
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	BaseURL string `json:"base_url"`
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else if r == ' ' || r == '-' || r == '_' {
			b.WriteByte('-')
		}
	}
	return strings.Trim(b.String(), "-")
}

// CreateClientStoreAdmin: POST /api/client-store-settlements/stores
// Returns the generated key ONCE so Logikraf can install it on the store app.
func CreateClientStoreAdmin(c fiber.Ctx) error {
	var in storeInput
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "payload tidak valid"})
	}
	in.Name = strings.TrimSpace(in.Name)
	in.BaseURL = strings.TrimSpace(strings.TrimSuffix(in.BaseURL, "/"))
	if in.Name == "" || in.BaseURL == "" {
		return c.Status(400).JSON(fiber.Map{"error": "nama & base_url wajib diisi"})
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Name)
	}
	in.Slug = slugify(in.Slug)
	if in.Slug == "" {
		return c.Status(400).JSON(fiber.Map{"error": "slug tidak valid"})
	}
	store := model.ClientStore{
		Slug: in.Slug, Name: in.Name, BaseURL: in.BaseURL,
		InternalKey: model.GenerateInternalKey(), IsActive: true,
	}
	if err := model.DB.Create(&store).Error; err != nil {
		return c.Status(409).JSON(fiber.Map{"error": "gagal membuat (slug mungkin sudah dipakai): " + err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{
		"store":        store,
		"internal_key": store.InternalKey, // hanya dikembalikan sekali ini
	})
}

// GetClientStoreKeyAdmin: GET /api/client-store-settlements/stores/:id/key
func GetClientStoreKeyAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var s model.ClientStore
	if err := model.DB.First(&s, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client store tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"store_id": s.ID, "slug": s.Slug, "internal_key": s.InternalKey})
}

// UpdateClientStoreAdmin: PUT /api/client-store-settlements/stores/:id
func UpdateClientStoreAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var in struct {
		Name     string `json:"name"`
		BaseURL  string `json:"base_url"`
		IsActive *bool  `json:"is_active"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "payload tidak valid"})
	}
	updates := map[string]interface{}{}
	if in.Name != "" {
		updates["name"] = strings.TrimSpace(in.Name)
	}
	if in.BaseURL != "" {
		updates["base_url"] = strings.TrimSpace(strings.TrimSuffix(in.BaseURL, "/"))
	}
	if in.IsActive != nil {
		updates["is_active"] = *in.IsActive
	}
	if len(updates) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "tidak ada perubahan"})
	}
	if err := model.DB.Model(&model.ClientStore{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "client store diperbarui"})
}

// RegenerateClientStoreKeyAdmin: POST /api/client-store-settlements/stores/:id/regenerate
func RegenerateClientStoreKeyAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var s model.ClientStore
	if err := model.DB.First(&s, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client store tidak ditemukan"})
	}
	s.InternalKey = model.GenerateInternalKey()
	if err := model.DB.Model(&s).Update("internal_key", s.InternalKey).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"store_id": s.ID, "slug": s.Slug, "internal_key": s.InternalKey}) // sekali ini
}

// DeleteClientStoreAdmin: DELETE /api/client-store-settlements/stores/:id
func DeleteClientStoreAdmin(c fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := model.DB.Delete(&model.ClientStore{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "client store dihapus"})
}

// ---- Internal fetch helpers ----

func fetchStoreSummary(baseURL, key string) (*StoreFinanceSummary, error) {
	body, err := doInternalGET(baseURL+"/finance/summary", key)
	if err != nil {
		return nil, err
	}
	var wrap struct {
		Data *StoreFinanceSummary `json:"data"`
	}
	if err := json.Unmarshal(body, &wrap); err != nil {
		return nil, err
	}
	if wrap.Data == nil {
		return nil, fmt.Errorf("respons store tidak berisi data")
	}
	return wrap.Data, nil
}

func fetchStoreSettlements(baseURL, key string) ([]StoreSettlement, error) {
	body, err := doInternalGET(baseURL+"/settlements", key)
	if err != nil {
		return nil, err
	}
	var wrap struct {
		Data []StoreSettlement `json:"data"`
	}
	if err := json.Unmarshal(body, &wrap); err != nil {
		return nil, err
	}
	return wrap.Data, nil
}

func doInternalGET(url, key string) ([]byte, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-Internal-Key", key)
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("client store merespons HTTP %d", resp.StatusCode)
	}
	return io.ReadAll(resp.Body)
}

// PayStoreSettlement marks a store's pending settlement as paid and uploads the
// transfer-proof file — proxied to the store's internal API. Logikraf performs
// the real bank transfer first (manual), then calls this.
// POST /api/client-store-settlements/pay (admin, multipart: store, settlement_id, result_note, proof)
func PayStoreSettlement(c fiber.Ctx) error {
	slug := c.FormValue("store")
	sid := c.FormValue("settlement_id")
	resultNote := c.FormValue("result_note")
	if slug == "" || sid == "" {
		return c.Status(400).JSON(fiber.Map{"error": "store & settlement_id wajib"})
	}
	var store model.ClientStore
	if err := model.DB.Where("slug = ? AND is_active = ?", slug, true).First(&store).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "client store tidak dikenal / nonaktif"})
	}
	if store.BaseURL == "" || store.InternalKey == "" {
		return c.Status(500).JSON(fiber.Map{"error": "base_url / internal key store belum diisi"})
	}

	src, err := c.FormFile("proof")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "file bukti transfer wajib diunggah"})
	}
	fh, err := src.Open()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "gagal membaca file bukti"})
	}
	defer fh.Close()

	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	fw, err := mw.CreateFormFile("proof", filepath.Base(src.Filename))
	if err == nil {
		_, err = io.Copy(fw, fh)
	}
	if err == nil {
		err = mw.WriteField("result_note", resultNote)
	}
	mw.Close()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyiapkan upload: " + err.Error()})
	}

	req, err := http.NewRequest(http.MethodPatch,
		store.BaseURL+"/settlements/"+sid+"/paid", &buf)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())
	req.Header.Set("X-Internal-Key", store.InternalKey)
	resp, err := httpClient.Do(req)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "tidak bisa menghubungi client store: " + err.Error()})
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return c.Status(502).JSON(fiber.Map{"error": fmt.Sprintf("client store menolak (HTTP %d): %s", resp.StatusCode, string(body))})
	}
	return c.JSON(fiber.Map{"message": "settlement ditandai dibayar ✓", "detail": json.RawMessage(body)})
}
