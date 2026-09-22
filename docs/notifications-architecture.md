# Arsitektur Notifikasi: WhatsApp & Email

> Dokumen ini menjelaskan desain dan implementasi kanal notifikasi **WhatsApp (GoWA)** dan **Email (BillionMail)** yang digunakan oleh Logikraf Payment Hub dan produk SaaS terkait.

---

## Daftar Isi

1. [Gambaran Sistem](#1-gambaran-sistem)
2. [WhatsApp via GoWA](#2-whatsapp-via-gowa)
3. [Email via BillionMail](#3-email-via-billionmail)
4. [Pola Multi-Kanal](#4-pola-multi-kanal)
5. [Scheduler: Pengingat Otomatis](#5-scheduler-pengingat-otomatis)
6. [Smarthub V3: Integrasi di Masa Depan](#6-smarthub-v3-integrasi-di-masa-depan)
7. [Templating & Lokalisasi](#7-templating--lokalisasi)
8. [Monitoring & Error Handling](#8-monitoring--error-handling)
9. [Checklist Implementasi](#9-checklist-implementasi)

---

## 1. Gambaran Sistem

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Logikraf       │     │  Smarthub V3    │     │  Produk SaaS    │
│  Payment Hub    │     │  (Hono/Bun)     │     │  Lainnya        │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              pkg/wa (Go WA Client)                              │
│              → HTTP ke GoWA server (mg001)                      │
└─────────────────────────────────────────────────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  GoWA Server    │     │  BillionMail    │
│  :3001          │     │  (SMTP/IMAP)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
   WhatsApp User          Email User
```

| Kanal | Provider | Fungsi Utama | Kapan Dipakai |
|-------|----------|--------------|---------------|
| WhatsApp | GoWA (self-hosted) | Notifikasi instan, pengingat cepat | Order baru, verifikasi, pengiriman file |
| Email | BillionMail | Notifikasi formal, lampiran PDF | Invoice, pengingat tagihan, reset password |

---

## 2. WhatsApp via GoWA

### 2.1 Arsitektur

GoWA berjalan sebagai server terpisah di VPS (`:3001`) dengan device ID `mg001`. Aplikasi Logikraf memanggil GoWA via HTTP REST.

**Client Library:** `logikraf-v2/pkg/wa/wa.go`

### 2.2 Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `WA_BASE_URL` | `http://127.0.0.1:3001` | URL server GoWA |
| `WA_DEVICE_ID` | `mg001` | ID device/nomor pengirim |
| `WA_BASIC_AUTH` | *(kosong)* | Basic auth untuk GoWA (format `user:pass`) |

### 2.3 API Reference

#### Send Message

```go
// Send — kirim pesan teks ke satu nomor.
func (c *Client) Send(phone, message string) error
```

**Request ke GoWA:**
```
POST /send/message
Content-Type: application/json

{
  "phone": "6281234567890",
  "message": "Halo, pesanan Anda sudah diproses.",
  "device_id": "mg001"
}
```

**Normalisasi nomor otomatis oleh `Normalize()`:**
- `08123456789` → `628123456789`
- `+62 812 3456 789` → `628123456789`
- `8123456789` → `628123456789`

### 2.4 Penggunaan di Kode

#### Import & Inisialisasi

```go
import "github.com/logikraf/logikraf-v2/pkg/wa"

func NotifyOrder(clientPhone, orderNumber string, amount uint) {
    c := wa.New()
    if !c.Enabled() {
        return  // skip jika WA tidak tersedia
    }
    
    msg := fmt.Sprintf(
        "Terima kasih, pembayaran untuk Order #%s telah kami terima.\n\nJumlah: Rp %s\n\nTim kami akan menghubungi Anda untuk langkah selanjutnya.",
        orderNumber, formatRupiah(amount),
    )
    _ = c.Send(clientPhone, msg)
}
```

#### Pemberitahuan Order Baru (GoWA)

```go
// logikraf-v2/internal/delivery/handler/order_wa.go
func notifyOrderWA(pt model.PaymentTransaction, orderID uint) {
    c := wa.New()
    if !c.Enabled() {
        return
    }
    
    // 1. Kabari admin
    if admin := setting("admin_notify_wa", "logikraf"); admin != "" {
        _ = c.Send(admin, fmt.Sprintf(
            "Pesanan baru masuk\nOrder #%d\nKlien: %s\nJumlah: Rp %s\nRef: %s",
            orderID, pt.ClientName, formatRupiah(pt.GrossAmount), pt.InvoiceRef,
        ))
    }
    
    // 2. Kabari klien
    if pt.ClientPhone != "" {
        _ = c.Send(pt.ClientPhone, fmt.Sprintf(
            "Terima kasih, pembayaran Anda sudah kami terima.\nOrder #%d\nJumlah: Rp %s\n\nTim Logikraf akan menghubungi Anda untuk langkah selanjutnya.",
            orderID, formatRupiah(pt.GrossAmount),
        ))
    }
}
```

### 2.5 Pesan Template (WhatsApp)

| Event | Template |
|-------|----------|
| Order dibuat | `Pesanan baru masuk\nOrder #{id}\nKlien: {name}\nJumlah: Rp {amount}\nRef: {ref}` |
| Pembayaran diterima | `Terima kasih, pembayaran Anda sudah kami terima.\nOrder #{id}\nJumlah: Rp {amount}` |
| Pengingat tagihan | `Pengingat tagihan {number}\nNama: {name}\nSisa tagihan: Rp {outstanding}\nJatuh tempo: {due_date}\n\nMohon selesaikan pembayaran.` |
| Verifikasi email | `Verifikasi email portal Logikraf\nTautan (berlaku 24 jam):\n{link}` |
| Reset password | `Reset kata sandi portal Logikraf\nTautan (berlaku 1 jam):\n{link}` |

---

## 3. Email via BillionMail

### 3.1 Arsitektur

Email dikirim via SMTP ke server BillionMail. Konfigurasi disimpan di database (tabel `settings`) dan di-load via `email.DefaultConfig()`.

**Client Library:** `logikraf-v2/pkg/email/email.go`

### 3.2 Konfigurasi

Konfigurasi email diambil dari `Settings` (DB) dengan key:
- `smtp_host` — hostname SMTP
- `smtp_port` — port (587/465)
- `smtp_user` — username SMTP
- `smtp_pass` — password SMTP
- `smtp_from` — alamat pengirim
- `smtp_from_name` — nama pengirim

```go
// Ambil konfigurasi dari DB
cfg := email.DefaultConfig()
if cfg.Host != "" {
    // Email siap dikirim
}
```

### 3.3 API Reference

#### Send Plain/HTML Email

```go
// Send — kirim email HTML ke satu atau banyak penerima.
func Send(cfg Config, to []string, subject, bodyHTML string) error
```

#### Send Invoice Reminder

```go
// SendInvoiceReminder — email pengingat tagihan dengan PDF terlampir.
func SendInvoiceReminder(
    cfg Config,
    to string,
    clientName string,
    invoiceNumber string,
    outstandingFormatted string,
    totalFormatted string,
    paidFormatted string,
    dueDate string,
    daysOverdue int,
    pdfAttachment []byte,
) error
```

### 3.4 Penggunaan di Kode

#### Kirim Email Verifikasi

```go
// logikraf-v2/pkg/auth/email_verify.go
func SendEmailVerification(user model.User) {
    if user.Email == "" {
        return
    }
    
    // Generate token
    token := generateSecureToken()
    link := portalBaseURL() + "/verify-email?token=" + token
    
    // Simpan token hash ke DB
    model.DB.Create(&model.EmailVerification{
        Email:     user.Email,
        TokenHash: hashToken(token),
        ExpiresAt: time.Now().Add(24 * time.Hour),
    })
    
    // Kirim email
    if cfg := email.DefaultConfig(); cfg.Host != "" {
        body := "<p>Halo " + name + ",</p>" +
            "<p>Terima kasih sudah mendaftar di portal Logikraf. " +
            "Mohon pastikan alamat email ini benar dengan menekan tautan berikut:</p>" +
            "<p><a href=\"" + link + "\">Verifikasi email saya</a></p>" +
            "<p>Tautan berlaku 24 jam dan hanya bisa dipakai sekali.</p>" +
            "<p>Salam,<br>Tim Logikraf</p>"
        
        go func() {
            _ = email.Send(cfg, []string{user.Email}, "Verifikasi email portal Logikraf", body)
        }()
    }
    
    // Kirim juga via WA jika ada nomor
    if num := clientWhatsApp(user.Email); num != "" {
        go func() {
            _ = wa.New().Send(num, "Verifikasi email portal Logikraf\nTautan (berlaku 24 jam):\n"+link)
        }()
    }
}
```

#### Kirim Pengingat Tagihan (dengan PDF)

```go
// logikraf-v2/pkg/scheduler/jobs.go
func RunReminderSend(ctx context.Context, db *gorm.DB) error {
    // ... query invoice yang jatuh tempo ...
    
    // 1. Kirim email dengan lampiran PDF
    pdf := generateInvoicePDF(inv, client, order)
    err := email.SendInvoiceReminder(
        cfg,
        client.Email,
        client.PICName,
        inv.InvoiceNumber,
        formatRupiah(outstanding),
        formatRupiah(inv.Total),
        formatRupiah(inv.PaidAmount),
        dueDate,
        daysOverdue,
        pdf,
    )
    
    // 2. Kirim juga via WA (lebih cepat dibaca)
    if client.Phone != "" {
        waMsg := "Pengingat tagihan " + inv.InvoiceNumber + "\n" +
            "Nama: " + name + "\n" +
            "Sisa tagihan: Rp " + formatRupiah(outstanding) + "\n" +
            "Jatuh tempo: " + dueDate
        if daysOverdue > 0 {
            waMsg += " (terlambat " + strconv.Itoa(daysOverdue) + " hari)"
        }
        _ = wa.New().Send(client.Phone, waMsg)
    }
    
    // 3. Log reminder
    db.Create(&model.InvoiceReminder{
        InvoiceID:   inv.ID,
        SentTo:      client.Email,
        DaysOverdue: daysOverdue,
        Outstanding: outstanding,
        Status:      "sent",
    })
}
```

### 3.5 Template Email (HTML)

#### Verifikasi Email
```html
<p>Halo {name},</p>
<p>Terima kasih sudah mendaftar di portal Logikraf.
   Mohon pastikan alamat email ini benar dengan menekan tautan berikut:</p>
<p><a href="{link}" style="padding:10px 20px;background:#1677ff;color:#fff;
   text-decoration:none;border-radius:6px;">Verifikasi email saya</a></p>
<p>Tautan berlaku 24 jam dan hanya bisa dipakai sekali.</p>
<p>Salam,<br>Tim Logikraf</p>
```

#### Reset Password
```html
<p>Halo {name},</p>
<p>Kami menerima permintaan reset kata sandi untuk akun Anda.
   Tekan tautan berikut untuk mengatur ulang:</p>
<p><a href="{link}">Reset kata sandi saya</a></p>
<p>Tautan berlaku 1 jam. Abaikan email ini bila tidak merasa meminta reset.</p>
```

#### Invoice / Tagihan
- Subject: `Tagihan {invoice_number} dari PT Logika Kreatif Indonesia`
- Body: Template HTML dengan tabel item + total
- Attachment: `invoice-{number}.pdf` (generated via `pkg/invoice`)

---

## 4. Pola Multi-Kanal

### 4.1 Kapan Mengirim via WA, Email, atau Keduanya?

| Event | WA | Email | Alasan |
|-------|:--:|:-----:|--------|
| Order baru (admin) | ✓ | | Instan, butuh respon cepat |
| Order baru (klien) | ✓ | ✓ | WA = konfirmasi cepat; Email = bukti formal |
| Pembayaran diterima | ✓ | | Langsung ke tangan |
| Tagihan/Invoice | | ✓ | Butuh PDF formal, arsip |
| Pengingat tagihan | ✓ | ✓ | WA = dibaca cepat; Email = lampiran PDF |
| Verifikasi email | ✓ | ✓ | Redundansi kanal |
| Reset password | ✓ | ✓ | Redundansi kanal |
| Ticket klien | ✓ | | Instan |
| Notifikasi sistem | ✓ | | Monitoring internal |

### 4.2 Pattern: Kirim Async (Go Routine)

Selalu kirim notifikasi dalam goroutine agar tidak menghambat request utama:

```go
// ❌ JANGAN: blocking di request handler
_ = email.Send(cfg, []string{to}, subject, body)  // tunggu selesai

// ✅ LAKUKAN: async dengan fire-and-forget
go func() {
    if err := email.Send(cfg, []string{to}, subject, body); err != nil {
        log.Printf("email gagal: %v", err)
    }
}()

go func() {
    if err := wa.New().Send(phone, msg); err != nil {
        log.Printf("wa gagal: %v", err)
    }
}()
```

### 4.3 Pattern: Graceful Failure

Notifikasi gagal **tidak boleh** menggagalkan proses utama:

```go
func notifyOrderComplete(order Order, client Client) {
    // Email gagal? Log saja, jangan return error
    if cfg := email.DefaultConfig(); cfg.Host != "" {
        go func() {
            if err := email.Send(cfg, []string{client.Email}, subject, body); err != nil {
                log.Printf("email order %d gagal: %v", order.ID, err)
            }
        }()
    }
    
    // WA gagal? Log saja
    if client.Phone != "" {
        go func() {
            if err := wa.New().Send(client.Phone, msg); err != nil {
                log.Printf("wa order %d gagal: %v", order.ID, err)
            }
        }()
    }
}
```

---

## 5. Scheduler: Pengingat Otomatis

### 5.1 Jadwal Cron

```go
// logikraf-v2/pkg/scheduler/jobs.go
type Job interface {
    Key() string
    Schedule() string  // cron expression
    Run(ctx, db) error
}
```

| Job Key | Schedule | Fungsi |
|---------|----------|--------|
| `invoice_reminders` | `0 9 * * *` (09:00) | Kirim pengingat tagihan via email+WA |
| `invoice_status_refresh` | `0 8 * * *` (08:00) | Update status invoice (sent→overdue) |

### 5.2 Logika Pengingat Tagihan

```
Jatuh tempo - 3 hari  → "Akan jatuh tempo"
Jatuh tempo (H)       → "Hari ini jatuh tempo"
Jatuh tempo + 1,3,7,14 → "Terlambat N hari"
Setelah H+14          → Setiap 14 hari sekali (berkala)
```

Implementasi:
```go
due := time.Date(inv.DueDate.Year(), inv.DueDate.Month(), inv.DueDate.Day(), 0, 0, 0, 0, tz)
today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, tz)
diff := int(today.Sub(due).Hours() / 24)

send := false
switch {
case diff == -3:        send = true  // 3 hari sebelum
case diff == 0:         send = true  // hari H
case diff == 1 || diff == 3 || diff == 7 || diff == 14: send = true
case diff > 14 && diff%14 == 0: send = true  // berkala
}
```

### 5.3 Idempotensi

Setiap pengiriman dicatat di `invoice_reminders` agar tidak dikirim dua kali di hari yang sama. Proses memilih invoice yang statusnya `sent` atau `partial` dan belum punya reminder hari ini.

---

## 6. Smarthub V3: Integrasi di Masa Depan

### 6.1 Perbedaan Stack

| Aspek | Logikraf V2 (Fiber/Go) | Smarthub V3 (Hono/Bun) |
|-------|------------------------|------------------------|
| Runtime | Go | Bun (TypeScript) |
| HTTP Client | net/http | `fetch()` bawaan |
| Goroutine | `go func()` | `Promise` / `setTimeout` |
| DB | GORM | Drizzle ORM |

### 6.2 Rencana Implementasi WA di Smarthub V3

```typescript
// Smarthub V3: backend/src/lib/wa.ts
export interface WAConfig {
  baseURL: string
  deviceId: string
  basicAuth?: { user: string; pass: string }
}

export class WAClient {
  private config: WAConfig
  
  constructor(config: WAConfig) {
    this.config = config
  }
  
  async send(phone: string, message: string): Promise<void> {
    const normalized = this.normalize(phone)
    if (!normalized) throw new Error('Nomor kosong')
    
    const res = await fetch(`${this.config.baseURL}/send/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.basicAuth && {
          'Authorization': `Basic ${btoa(`${this.config.basicAuth.user}:${this.config.basicAuth.pass}`)}`
        })
      },
      body: JSON.stringify({
        phone: normalized,
        message,
        device_id: this.config.deviceId,
      }),
    })
    
    if (!res.ok) {
      throw new Error(`WA ${res.status}: ${await res.text()}`)
    }
  }
  
  private normalize(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('0')) return '62' + digits.slice(1)
    if (digits.startsWith('62')) return digits
    if (digits.startsWith('8')) return '62' + digits
    return digits
  }
}

// Instance default
export const wa = new WAClient({
  baseURL: process.env.WA_BASE_URL || 'http://127.0.0.1:3001',
  deviceId: process.env.WA_DEVICE_ID || 'mg001',
})
```

### 6.3 Rencana Implementasi Email di Smarthub V3

```typescript
// Smarthub V3: backend/src/lib/mailer.ts
import nodemailer from 'nodemailer'

export interface MailConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
  fromName: string
}

let transporter: nodemailer.Transporter | null = null

export function initMailer(cfg: MailConfig): void {
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  })
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: Buffer }[]
): Promise<void> {
  if (!transporter) throw new Error('Mailer tidak diinisialisasi')
  
  await transporter.sendMail({
    from: `"${cfg.fromName}" <${cfg.from}>`,
    to,
    subject,
    html,
    attachments,
  })
}
```

### 6.4 Contoh: Notifikasi di Smarthub V3

```typescript
// backend/src/api/payments.routes.ts (future)
import { wa } from '../lib/wa'
import { sendMail } from '../lib/mailer'

paymentRoutes.post('/:id/confirm', async (c) => {
  const payment = await confirmPayment(c.req.param('id'))
  const house = await getHouse(payment.houseId)
  
  // Kirim notifikasi async (fire-and-forget)
  const msg = `Pembayaran IPL bulan ${payment.month} telah diterima.\nJumlah: Rp ${formatRp(payment.amount)}\nTerima kasih.`
  
  // WA ke penghuni
  if (house.contactPhone) {
    wa.send(house.contactPhone, msg).catch(err =>
      console.error('WA gagal:', err)
    )
  }
  
  // Email ke penghuni
  if (house.contactEmail) {
    sendMail(
      house.contactEmail,
      `Pembayaran IPL ${house.blok}-${house.nomorRumah}`,
      `<p>Pembayaran IPL bulan <strong>${payment.month}</strong> telah diterima.</p><p>Jumlah: Rp ${formatRp(payment.amount)}</p>`
    ).catch(err => console.error('Email gagal:', err))
  }
  
  return c.json({ data: payment })
})
```

---

## 7. Templating & Lokalisasi

### 7.1 Bahasa

Saat ini semua notifikasi menggunakan Bahasa Indonesia. Untuk multi-language di masa depan:

```go
type MessageTemplate struct {
    KeyID   string // "order_paid", "reminder_3d", etc.
    Lang    string // "id", "en"
    Channel string // "wa", "email"
    Body    string
}
```

### 7.2 Variabel Template

Placeholder yang tersedia:

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `{name}` | Nama klien | Ahmad Rizky |
| `{company}` | Nama perusahaan | PT Maju Bersama |
| `{order_id}` | ID pesanan | 1234 |
| `{invoice_number}` | Nomor invoice | INV-2026/0001 |
| `{amount}` | Jumlah (formatted) | 2.500.000 |
| `{due_date}` | Tanggal jatuh tempo | 15-09-2026 |
| `{link}` | Tautan akses | https://portal.logikraf.id/... |

### 7.3 Lokalisasi Tanggal

Gunakan format Indonesia (`DD-MM-YYYY`) untuk tanggal di pesan:

```go
invDueDate.Format("02-01-2006")  // 15-09-2026
```

---

## 8. Monitoring & Error Handling

### 8.1 Error Handling

| Error | Penanganan |
|-------|------------|
| GoWA tidak reachable | Log error, lanjutkan (notifikasi gagal tidak gagalkan proses) |
| SMTP connection refused | Log error, retry di siklus berikutnya |
| Nomor WA tidak valid | Normalize gagal → skip, log warning |
| Email tidak terkirim | Log error, catat di `invoice_reminders.status = "failed"` |

### 8.2 Logging

```go
// Log setiap pengiriman
log.Printf("✅ WA terkirim ke %s (order %d)", clientPhone, orderID)
log.Printf("❌ WA gagal ke %s: %v", clientPhone, err)
log.Printf("📧 Email terkirim ke %s (invoice %s)", clientEmail, invNumber)
```

### 8.3 Metrics (Future)

Untuk monitoring, catat metrik:
- `wa_sent_total` — total WA terkirim
- `wa_failed_total` — total WA gagal
- `email_sent_total` — total email terkirim
- `email_failed_total` — total email gagal
- `reminder_sent_total` — total pengingat tagihan

---

## 9. Checklist Implementasi

Saat mengintegrasikan notifikasi ke produk SaaS baru (seperti Smarthub V3):

### WhatsApp

- [ ] Pastikan GoWA server (`:3001`) bisa diakses dari aplikasi
- [ ] Set env vars: `WA_BASE_URL`, `WA_DEVICE_ID`, `WA_BASIC_AUTH`
- [ ] Implementasi `normalize()` untuk nomor Indonesia
- [ ] Kirim async (goroutine/Promise) — jangan blocking
- [ ] Graceful failure — log error, jangan crash
- [ ] Validasi nomor tidak kosong sebelum kirim

### Email

- [ ] Dapatkan kredensial SMTP dari admin (BillionMail)
- [ ] Set env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- [ ] Buat template HTML reusable
- [ ] Attachment PDF? Gunakan `pkg/invoice` atau generator sendiri
- [ ] Kirim async
- [ ] Graceful failure
- [ ] Test kirim ke email uji sebelum production

### Pengingat Tagihan (Jika Ada)

- [ ] Jadwalkan cron job (08:00 untuk status refresh, 09:00 untuk reminder)
- [ ] Implementasi logika cadence (-3, 0, +1, +3, +7, +14, +14n)
- [ ] Simpan log pengiriman agar tidak double-send
- [ ] Sertakan PDF invoice sebagai attachment

### Multi-Tenant (Smarthub V3)

- [ ] Setiap tenant bisa punya pengaturan notifikasi sendiri
- [ ] WA sender bisa per-tenant (device_id berbeda) atau shared (mg001)
- [ ] Email sender bisa per-tenant atau shared
- [ ] Scope notification access berdasarkan role (superadmin, pengurus, warga)

---

## Lampiran: Env Vars Lengkap

```bash
# WhatsApp (GoWA)
WA_BASE_URL=http://127.0.0.1:3001
WA_DEVICE_ID=mg001
WA_BASIC_AUTH=user:pass  # opsional

# Email (BillionMail) — disimpan di DB Settings, bisa juga via env
SMTP_HOST=smtp.billionmail.id
SMTP_PORT=587
SMTP_USER=noreply@logikraf.id
SMTP_PASS=app_password_here
SMTP_FROM=noreply@logikraf.id
SMTP_FROM_NAME="PT Logika Kreatif Indonesia"
```

---

> **Catatan:** Dokumen ini akan diperbarui seiring perkembangan implementasi di Smarthub V3 dan produk SaaS berikutnya. Perubahan signifikan: update section terkait + tanggal revisi.
