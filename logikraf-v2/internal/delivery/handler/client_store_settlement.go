package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
)

// ClientStore is a store that runs on Logikraf's payment infrastructure
// (money settles into Logikraf's Xendit account). Each store exposes an
// internal finance API protected by X-Internal-Key.
type ClientStore struct {
	Slug    string `json:"slug"`
	Name    string `json:"name"`
	BaseURL string `json:"base_url"`
}

// ClientStoreSettlementView is the aggregated view shown on logikraf.id admin.
type ClientStoreSettlementView struct {
	Slug        string               `json:"slug"`
	Name        string               `json:"name"`
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
	CreatedAt  string `json:"created_at"`
	PaidAt     string `json:"paid_at"`
}

var httpClient = &http.Client{Timeout: 6 * time.Second}

// loadClientStores reads the store list from CLIENT_STORES (JSON array) or
// falls back to a single MysticGlide entry from MG_INTERNAL_URL.
func loadClientStores() []ClientStore {
	raw := os.Getenv("CLIENT_STORES")
	if raw != "" {
		var list []ClientStore
		if uerr := json.Unmarshal([]byte(raw), &list); uerr == nil && len(list) > 0 {
			return list
		}
		log.Printf("client_store: CLIENT_STORES invalid, fallback single store")
	}
	return []ClientStore{{
		Slug:    "mysticglide",
		Name:    "Mystic Glide",
		BaseURL: os.Getenv("MG_INTERNAL_URL"),
	}}
}

func internalKey() string { return os.Getenv("MG_INTERNAL_KEY") }

// GetClientStoreSettlements returns every client store's finance + settlement
// snapshot, fetched live from each store's internal API.
// GET /api/client-store-settlements (admin)
func GetClientStoreSettlements(c fiber.Ctx) error {
	key := internalKey()
	stores := loadClientStores()
	views := make([]ClientStoreSettlementView, 0, len(stores))

	for _, st := range stores {
		v := ClientStoreSettlementView{Slug: st.Slug, Name: st.Name, FetchedAt: time.Now()}
		if st.BaseURL == "" || key == "" {
			v.Error = "store URL / key belum dikonfigurasi"
			views = append(views, v)
			continue
		}
		sum, err := fetchStoreSummary(st.BaseURL, key)
		if err != nil {
			v.Error = err.Error()
			views = append(views, v)
			continue
		}
		v.Reachable = true
		v.Summary = sum
		v.Settlements, _ = fetchStoreSettlements(st.BaseURL, key)
		views = append(views, v)
	}
	return c.JSON(fiber.Map{"stores": views})
}

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
		return nil, err
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
