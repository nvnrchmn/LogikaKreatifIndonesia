// Package ipaymu provides a shared client for iPaymu v2 API. It is used by both
// logikraf (Payment Hub server) and smarthub (tenant client) so the signature
// logic and config stay in one place.
//
// Signature spec (iPaymu v2):
//
//	stringToSign = METHOD + ":" + va + ":" + SHA256(body) + ":" + apiKey
//	signature    = HMAC-SHA256(stringToSign, apiKey) // hex lowercase
//
// Reference: https://docs.ipaymu.com/en/docs
package ipaymu

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Config holds the master iPaymu credentials. In a multi-tenant deployment,
// the master account belongs to Logikraf, and sub-merchants are created per
// tenant via the submerchant API.
type Config struct {
	Env      string // "sandbox" or "production"
	MasterVA string
	MasterKey string
}

// LoadConfigFromEnv builds Config from environment variables.
func LoadConfigFromEnv() Config {
	env := strings.ToLower(os.Getenv("IPAYMU_ENV"))
	if env == "" {
		env = "sandbox"
	}
	return Config{
		Env:      env,
		MasterVA: os.Getenv("IPAYMU_MASTER_VA"),
		MasterKey: os.Getenv("IPAYMU_MASTER_KEY"),
	}
}

// BaseURL returns the iPaymu base URL for the current environment.
func (c Config) BaseURL() string {
	if c.Env == "production" {
		return "https://my.ipaymu.com"
	}
	return "https://sandbox.ipaymu.com"
}

// Client wraps the iPaymu v2 API.
type Client struct {
	Config Config
	HTTP   *http.Client
}

// NewClient builds a Client from env config.
func NewClient() *Client {
	return NewClientWithConfig(LoadConfigFromEnv())
}

// NewClientWithConfig builds a Client from the given config.
func NewClientWithConfig(cfg Config) *Client {
	return &Client{
		Config: cfg,
		HTTP:   &http.Client{Timeout: 15 * time.Second},
	}
}

// Sign produces the iPaymu v2 signature for a given method + body.
func (c *Client) Sign(method string, body []byte) string {
	bodyHash := sha256.Sum256(body)
	bodyHashStr := strings.ToLower(hex.EncodeToString(bodyHash[:]))
	stringToSign := fmt.Sprintf("%s:%s:%s:%s",
		strings.ToUpper(method), c.Config.MasterVA, bodyHashStr, c.Config.MasterKey)
	h := hmac.New(sha256.New, []byte(c.Config.MasterKey))
	h.Write([]byte(stringToSign))
	return hex.EncodeToString(h.Sum(nil))
}

// Timestamp returns the timestamp header value iPaymu expects for some endpoints.
func (c *Client) Timestamp() string {
	return time.Now().Format("20060102150405")
}

// Do signs the request and sends it.
func (c *Client) Do(method, path string, body []byte) ([]byte, int, error) {
	url := c.Config.BaseURL() + path

	var req *http.Request
	var err error
	if body != nil {
		req, err = http.NewRequest(method, url, strings.NewReader(string(body)))
	} else {
		req, err = http.NewRequest(method, url, nil)
	}
	if err != nil {
		return nil, 0, err
	}

	signature := c.Sign(method, body)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("signature", signature)
	req.Header.Set("va", c.Config.MasterVA)
	req.Header.Set("timestamp", c.Timestamp())

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, nil
}

// APIResponse is the generic envelope iPaymu returns.
type APIResponse struct {
	Status bool            `json:"status"`
	Data   json.RawMessage `json:"data"`
	Error  string          `json:"error"`
}
