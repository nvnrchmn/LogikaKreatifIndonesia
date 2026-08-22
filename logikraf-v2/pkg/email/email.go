package email

import (
	"fmt"
	"net/smtp"
	"os"
)

// Config holds SMTP configuration
type Config struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

// DefaultConfig returns default email config from environment
func DefaultConfig() Config {
	host := getEnv("SMTP_HOST", "127.0.0.1")
	port := getEnv("SMTP_PORT", "587")
	user := getEnv("SMTP_USER", "")
	pass := getEnv("SMTP_PASS", "")
	from := getEnv("SMTP_FROM", "noreply@logikraf.id")

	return Config{
		Host:     host,
		Port:     port,
		Username: user,
		Password: pass,
		From:     from,
	}
}

// Send sends an email using SMTP
func Send(cfg Config, to []string, subject, body string) error {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	// Build headers
	headers := make(map[string]string)
	headers["From"] = cfg.From
	headers["To"] = to[0]
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"utf-8\""

	// Build message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Auth if credentials provided
	var auth smtp.Auth
	if cfg.Username != "" && cfg.Password != "" {
		auth = smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)
	}

	return smtp.SendMail(addr, auth, cfg.From, to, []byte(message))
}

// SendPaymentReceipt sends a payment receipt email to client
func SendPaymentReceipt(cfg Config, to, clientName, packageName, amount, transactionID string) error {
	subject := "Pembayaran Diterima - " + transactionID
	body := fmt.Sprintf(`
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #1a73e8;">Terima Kasih, %s!</h2>
<p>Pembayaran Anda telah kami terima dengan detail:</p>
<table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Paket</strong></td><td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Jumlah</strong></td><td style="padding: 8px; border: 1px solid #ddd;">Rp %s</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>ID Transaksi</strong></td><td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
</table>
<p>Tim kami akan segera menghubungi Anda untuk langkah selanjutnya.</p>
<p>Salam,<br><strong>Tim Logikraf</strong></p>
</div>
</body>
</html>
`, clientName, packageName, amount, transactionID)

	return Send(cfg, []string{to}, subject, body)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
