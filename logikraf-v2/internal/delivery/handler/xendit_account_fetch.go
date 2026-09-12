package handler

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"
)

// XenAccountDetail — data akun Managed langsung dari Xendit (bukan dari DB).
type XenAccountDetail struct {
	ID           string `json:"id"`
	Email        string `json:"email"`
	Status       string `json:"status"`
	Country      string `json:"country"`
	Updated      string `json:"updated"`
	Created      string `json:"created"`
	BusinessName string `json:"business_name"`
}

// fetchXenAccount — ambil detail sub-account dari Xendit (kunci: settings xendit_secret_key).
// Mengembalikan detail, HTTP status Xendit, pesan error Xendit (bila ada), dan error lokal.
func fetchXenAccount(subAccountID string) (XenAccountDetail, int, string, error) {
	var out XenAccountDetail
	secret := setting("xendit_secret_key", "logikraf")
	if secret == "" {
		return out, 0, "xendit_secret_key belum dikonfigurasi", nil
	}
	req, err := http.NewRequest(http.MethodGet, "https://api.xendit.co/v2/accounts/"+subAccountID, nil)
	if err != nil {
		return out, 0, "", err
	}
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(secret+":")))
	resp, err := (&http.Client{Timeout: 15 * time.Second}).Do(req)
	if err != nil {
		return out, 0, "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != 200 {
		msg := strings.TrimSpace(string(body))
		if len(msg) > 200 {
			msg = msg[:200]
		}
		return out, resp.StatusCode, msg, nil
	}
	var raw struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		Status        string `json:"status"`
		Country       string `json:"country"`
		Updated       string `json:"updated"`
		Created       string `json:"created"`
		PublicProfile struct {
			BusinessName string `json:"business_name"`
		} `json:"public_profile"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		return out, 0, "", err
	}
	out = XenAccountDetail{ID: raw.ID, Email: raw.Email, Status: raw.Status, Country: raw.Country,
		Updated: raw.Updated, Created: raw.Created, BusinessName: raw.PublicProfile.BusinessName}
	return out, 200, "", nil
}
