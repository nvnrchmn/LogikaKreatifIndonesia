package email

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"net/smtp"
	"os"
	"strconv"
	"time"
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
	// Default to the mail hostname, NOT 127.0.0.1: the SMTP server presents a
	// certificate for mail.logikraf.id, so connecting by IP fails STARTTLS
	// verification with "doesn't contain any IP SANs".
	host := getEnv("SMTP_HOST", "mail.logikraf.id")
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
func SendPaymentReceipt(cfg Config, to, clientName, packageName, amount, transactionID string, pdf []byte) error {
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

	if len(pdf) > 0 {
		return SendWithAttachment(cfg, []string{to}, subject, body, "invoice-"+transactionID+".pdf", pdf)
	}
	return Send(cfg, []string{to}, subject, body)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// SendInvoiceReminder emails a client about an unpaid invoice.
//
// The copy adapts to the situation because a polite pre-due nudge and a chase on
// a 60-day-late invoice should not read the same. amountDue is the OUTSTANDING
// balance, not the invoice total, so a client who already paid a deposit is
// never asked for the full amount again.
func SendInvoiceReminder(
	cfg Config,
	to, clientName, invoiceNumber string,
	amountDue, total, alreadyPaid string,
	dueDate string,
	daysOverdue int,
	pdf []byte,
) error {
	var subject, headline, tone string
	switch {
	case daysOverdue <= 0:
		subject = "Pengingat Tagihan " + invoiceNumber
		headline = "Pengingat Pembayaran"
		tone = "Kami ingin mengingatkan bahwa tagihan berikut akan jatuh tempo pada <strong>" + dueDate + "</strong>."
	case daysOverdue <= 30:
		subject = "Tagihan " + invoiceNumber + " Telah Jatuh Tempo"
		headline = "Tagihan Jatuh Tempo"
		tone = "Tagihan berikut telah melewati batas pembayaran <strong>" + dueDate +
			"</strong> (" + itoa(daysOverdue) + " hari). Mohon segera diselesaikan."
	default:
		subject = "Mohon Perhatian: Tagihan " + invoiceNumber + " Tertunggak " + itoa(daysOverdue) + " Hari"
		headline = "Tagihan Tertunggak"
		tone = "Tagihan berikut telah tertunggak <strong>" + itoa(daysOverdue) +
			" hari</strong> sejak jatuh tempo " + dueDate +
			". Mohon konfirmasi rencana pembayaran agar pengerjaan tidak terhambat."
	}

	partial := ""
	if alreadyPaid != "" && alreadyPaid != "0" {
		partial = `<tr><td style="padding:8px;border:1px solid #ddd;">Sudah dibayar</td>` +
			`<td style="padding:8px;border:1px solid #ddd;">Rp ` + alreadyPaid + `</td></tr>`
	}

	body := `<html><body style="font-family:Arial,sans-serif;color:#333;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
<h2 style="color:#1a73e8;margin-bottom:4px;">` + headline + `</h2>
<p>Halo <strong>` + clientName + `</strong>,</p>
<p>` + tone + `</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<tr><td style="padding:8px;border:1px solid #ddd;">No. Invoice</td><td style="padding:8px;border:1px solid #ddd;"><strong>` + invoiceNumber + `</strong></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;">Total tagihan</td><td style="padding:8px;border:1px solid #ddd;">Rp ` + total + `</td></tr>` + partial + `
<tr style="background:#fff8e1;"><td style="padding:8px;border:1px solid #ddd;"><strong>Sisa yang harus dibayar</strong></td><td style="padding:8px;border:1px solid #ddd;"><strong>Rp ` + amountDue + `</strong></td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;">Jatuh tempo</td><td style="padding:8px;border:1px solid #ddd;">` + dueDate + `</td></tr>
</table>
<p style="font-size:12px;color:#777;">Jika pembayaran sudah dilakukan, mohon abaikan email ini dan kirimkan bukti transfer kepada kami.</p>
<p>Terima kasih,<br><strong>Tim Logikraf</strong></p>
</div></body></html>`

	if len(pdf) > 0 {
		return SendWithAttachment(cfg, []string{to}, subject, body, "tagihan-"+invoiceNumber+".pdf", pdf)
	}
	return Send(cfg, []string{to}, subject, body)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var b [20]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		b[i] = '-'
	}
	return string(b[i:])
}

// SendOrderOnboarding — email "langkah selanjutnya" ke klien setelah pembayaran
// diterima, supaya pekerjaan bisa mulai tanpa bolak-balik manual.
func SendOrderOnboarding(cfg Config, to, clientName, orderNumber, amount, portalText string) error {
	if to == "" {
		return nil
	}
	name := clientName
	if name == "" {
		name = "Bapak/Ibu"
	}
	subject := "Langkah selanjutnya - pesanan " + orderNumber
	if portalText == "" {
		portalText = "Pantau pesanan Anda di https://logikraf.id/client."
	}
	body := fmt.Sprintf(`
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #1a73e8;">Terima kasih, %s!</h2>
<p>Pembayaran untuk pesanan <strong>%s</strong> (Rp %s) sudah kami terima.</p>
<p>Agar pekerjaan bisa segera dimulai, mohon siapkan dan kirimkan:</p>
<ol>
<li><strong>Akses domain &amp; hosting</strong> (bila sudah ada) — atau kami bantu pendaftarannya.</li>
<li><strong>Aset brand</strong>: logo (PNG/SVG), warna utama, foto produk/layanan.</li>
<li><strong>Materi konten</strong>: profil usaha, daftar layanan &amp; harga, kontak, alamat.</li>
<li><strong>Data penagihan</strong>: nama badan usaha, NPWP (bila ada), alamat.</li>
<li><strong>PIC</strong>: nama, WhatsApp, dan email yang bisa dihubungi.</li>
</ol>
<p style="background:#f5f7ff;padding:12px;border-radius:6px;white-space:pre-line;">%s</p>
<p>Balas email ini atau WhatsApp kami begitu daftar di atas siap — kami kirim jadwal kickoff.</p>
<p>Salam,<br><strong>Tim Logikraf</strong><br><a href="https://logikraf.id">logikraf.id</a></p>
</div>
</body>
</html>
`, name, orderNumber, amount, portalText)
	return Send(cfg, []string{to}, subject, body)
}

// sendRaw — kirim pesan MIME mentah (dipakai fungsi ber-lampiran).
func sendRaw(cfg Config, to []string, message []byte) error {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)
	var auth smtp.Auth
	if cfg.Username != "" && cfg.Password != "" {
		auth = smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)
	}
	return smtp.SendMail(addr, auth, cfg.From, to, message)
}

// SendWithAttachment — kirim email HTML dengan satu lampiran PDF (mis. invoice).
func SendWithAttachment(cfg Config, to []string, subject, body, fileName string, fileData []byte) error {
	if len(to) == 0 || to[0] == "" || len(fileData) == 0 {
		return nil
	}
	boundary := "logikraf-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	return sendRaw(cfg, to, attachmentMIME(cfg.From, to[0], subject, body, fileName, fileData, boundary))
}

// attachmentMIME — susun pesan MIME multipart/mixed. Dipisah dari pengiriman agar
// struktur pesannya bisa diuji tanpa SMTP.
func attachmentMIME(from, to, subject, body, fileName string, fileData []byte, boundary string) []byte {
	var b bytes.Buffer
	fmt.Fprintf(&b, "From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\n", from, to, subject)
	fmt.Fprintf(&b, "Content-Type: multipart/mixed; boundary=\"%s\"\r\n\r\n", boundary)
	fmt.Fprintf(&b, "--%s\r\nContent-Type: text/html; charset=\"utf-8\"\r\n\r\n%s\r\n", boundary, body)
	fmt.Fprintf(&b, "--%s\r\nContent-Type: application/pdf; name=\"%s\"\r\n", boundary, fileName)
	fmt.Fprintf(&b, "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"%s\"\r\n\r\n", fileName)
	enc := base64.StdEncoding.EncodeToString(fileData)
	for i := 0; i < len(enc); i += 76 {
		end := i + 76
		if end > len(enc) {
			end = len(enc)
		}
		b.WriteString(enc[i:end])
		b.WriteString("\r\n")
	}
	fmt.Fprintf(&b, "\r\n--%s--\r\n", boundary)
	return b.Bytes()
}
