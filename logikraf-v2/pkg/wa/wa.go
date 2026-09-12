package wa

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Client — klien GoWA untuk notifikasi WhatsApp. Env: WA_BASE_URL
// (default http://127.0.0.1:3001), WA_DEVICE_ID (default mg001),
// WA_BASIC_AUTH ("user:pass", opsional).
type Client struct {
	http    *http.Client
	baseURL string
	device  string
	user    string
	pass    string
}

func New() *Client {
	base := strings.TrimRight(os.Getenv("WA_BASE_URL"), "/")
	if base == "" {
		base = "http://127.0.0.1:3001"
	}
	dev := os.Getenv("WA_DEVICE_ID")
	if dev == "" {
		dev = "mg001"
	}
	u, p := "", ""
	if ba := os.Getenv("WA_BASIC_AUTH"); ba != "" {
		if i := strings.Index(ba, ":"); i > 0 {
			u, p = ba[:i], ba[i+1:]
		}
	}
	return &Client{http: &http.Client{Timeout: 30 * time.Second}, baseURL: base, device: dev, user: u, pass: p}
}

func (c *Client) Enabled() bool { return c.baseURL != "" }

// Send — kirim pesan teks ke satu nomor.
func (c *Client) Send(phone, message string) error {
	to := Normalize(phone)
	if to == "" {
		return fmt.Errorf("nomor kosong")
	}
	payload, _ := json.Marshal(map[string]string{
		"phone":     to,
		"message":   message,
		"device_id": c.device,
	})
	req, err := http.NewRequest(http.MethodPost, c.baseURL+"/send/message", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.user != "" {
		req.SetBasicAuth(c.user, c.pass)
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		s := strings.TrimSpace(string(b))
		if len(s) > 200 {
			s = s[:200]
		}
		return fmt.Errorf("gowa %d: %s", resp.StatusCode, s)
	}
	return nil
}

// Normalize — 08xx / +62xx / 62xx / 8xx → 628xx
func Normalize(phone string) string {
	var d strings.Builder
	for _, r := range phone {
		if r >= '0' && r <= '9' {
			d.WriteRune(r)
		}
	}
	s := d.String()
	switch {
	case strings.HasPrefix(s, "0"):
		return "62" + s[1:]
	case strings.HasPrefix(s, "62"):
		return s
	case strings.HasPrefix(s, "8"):
		return "62" + s
	}
	return s
}
