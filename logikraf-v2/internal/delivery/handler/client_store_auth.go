package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// resolveClientStore — autentikasi client store via header X-Internal-Key
// (constant-time terhadap ClientStore.InternalKey). Ini header resmi yang
// dipakai kode Hub (bukan X-Logikraf-Internal-Key versi dokumen lama).
func resolveClientStore(c fiber.Ctx) (*model.ClientStore, bool) {
	got := strings.TrimSpace(c.Get("X-Internal-Key"))
	if got == "" {
		return nil, false
	}
	var stores []model.ClientStore
	if err := model.DB.Where("is_active = 1").Find(&stores).Error; err != nil {
		return nil, false
	}
	for i := range stores {
		if stores[i].InternalKey != "" &&
			subtle.ConstantTimeCompare([]byte(got), []byte(stores[i].InternalKey)) == 1 {
			return &stores[i], true
		}
	}
	return nil, false
}

func clientStoreAuthError(c fiber.Ctx) error {
	return c.Status(401).JSON(fiber.Map{"error": "missing or invalid X-Internal-Key"})
}

// resolveSubAccount — cari sub-akun tenant milik store, berdasarkan id Xendit
// ATAU tenant_ref. Mengembalikan (nil, gorm.ErrRecordNotFound) bila tak ada.
func resolveSubAccount(storeID uint, accountID, tenantRef string) (*model.ClientSubAccount, error) {
	q := model.DB.Where("store_id = ?", storeID)
	switch {
	case strings.TrimSpace(accountID) != "":
		q = q.Where("sub_account_id = ?", strings.TrimSpace(accountID))
	case strings.TrimSpace(tenantRef) != "":
		q = q.Where("tenant_ref = ?", strings.TrimSpace(tenantRef))
	default:
		return nil, nil
	}
	var sub model.ClientSubAccount
	if err := q.First(&sub).Error; err != nil {
		return nil, err
	}
	return &sub, nil
}

// xenditPlatformSecret — kunci master Xendit Logikraf (dipakai semua panggilan
// atas nama sub-akun via header for-user-id).
func xenditPlatformSecret() string {
	return setting("xendit_secret_key", "logikraf")
}

func xenditPlatformAuth(secret string) string {
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(secret+":"))
}

// hmacSHA256Hex — tanda tangan body untuk header X-Logikraf-Signature-Hmac.
func hmacSHA256Hex(secret string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}
