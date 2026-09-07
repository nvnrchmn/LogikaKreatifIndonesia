package handler

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ForwardToClientStore — Payment Hub routing: kalau external_id webhook Xendit
// diawali prefix client store aktif (contoh "mg-"), seluruh payload callback
// DIFORWARD ke webhook store (`BaseURL + /api/v1/webhook/xendit`, atau kolom
// webhook_url kalau diisi) dengan header `X-Logikraf-Signature` (shared secret
// per store). Alasan: akun Xendit milik Logikraf → satu URL webhook di dashboard
// (logikraf.id) → store tidak perlu konfigurasi webhook sendiri.
//
// Return handled=true artinya request ini milik client store (sukses diforward
// atau gagal — error mesti diteruskan ke caller supaya Xendit me-retry).
func ForwardToClientStore(c fiber.Ctx, externalID string) (bool, error) {
	if externalID == "" {
		return false, nil
	}
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1 AND ext_prefix <> ''").Find(&stores).Error; err != nil {
		return false, err
	}
	var store *model.ClientStore
	for i := range stores {
		if strings.HasPrefix(externalID, stores[i].ExtPrefix) {
			store = &stores[i]
			break
		}
	}
	if store == nil {
		return false, nil // bukan client store — proses lokal
	}

	whURL := store.WebhookURL
	if whURL == "" {
		whURL = strings.TrimSuffix(store.BaseURL, "/") + "/api/v1/webhook/xendit"
	}
	if whURL == "" {
		return true, fmt.Errorf("client store %s tanpa base_url/webhook_url", store.Slug)
	}

	body := c.Body()
	req, err := http.NewRequest(http.MethodPost, whURL, bytes.NewReader(body))
	if err != nil {
		return true, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Logikraf-Signature", store.WebhookSecret)
	if tk := c.Get("X-Callback-Token"); tk != "" {
		req.Header.Set("X-Callback-Token", tk) // fallback utk store jalur langsung
	}

	client := &http.Client{Timeout: 12 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return true, err
	}
	defer resp.Body.Close()
	_, _ = io.Copy(io.Discard, resp.Body)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return true, nil
	}
	return true, fmt.Errorf("webhook store %s balas HTTP %d", store.Slug, resp.StatusCode)
}
