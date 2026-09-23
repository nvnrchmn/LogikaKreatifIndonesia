### 1.2 Keputusan Pemilik (23 Sep 2026)

| # | Keputusan | Nilai |
|---|---|---|
| 1 | Model settlement | **A** — dana terkumpul di master, pencairan berkala |
| 2 | Kanal bayar | **QRIS saja** (dinamis per tagihan) |
| 3 | Fee Logikraf | **Split per transaksi + langganan bulanan** (split mengurangi langganan) |
| 4 | Tenant mayoritas | Ketua RT perorangan |
| 5 | Kas manual | Tetap dipertahankan (warga bayar tunai via bendahara) |

### 1.3 Kenapa Model A (bukan sub-account per tenant)

- **Friction KYC**: liveness/selfie wajib per tenant; mayoritas ketua RT perorangan; ganti pengurus = KYC ulang. Model A hanya butuh 1 KYC (sudah punya).
- **Money-out**: sub-account managed default `None`; tenant hanya bisa tarik dari dashboard Xendit. Model A memberi kontrol penuh lewat Smarthub.
- **Biaya**: potensi biaya inactivity per sub-account menganggur; Model A tidak.
- **Kecepatan launch**: infrastruktur hub sudah mendukung pola ini (persis model MG sekarang).

### 1.4 Risiko Utama Model A (jujur, bukan dipoles)

1. **Logikraf memegang uang kas pihak ketiga** — dana iuran warga ditampung di rekening/akun Logikraf sebelum diteruskan ke tenant. Dari sisi Xendit & regulator, ini area yang bisa dinilai sebagai aktivitas penampungan dana / bertindak sebagai penyelenggara tanpa izin.
2. **Nama merchant di mutasi bank warga = Logikraf** — bukan perumahan. Kurang transparan untuk warga.
3. **Rekening Logikraf diblokir/ditangguhkan → semua dana tenant ikut terkunci.**
4. **Rekonsiliasi manual** — volume besar rawan selisih.
5. **Pajak** — dana yang mengalir harus jelas bukan pendapatan Logikraf.

> **Mitigasi risiko ini ada di Bagian 10.** Model A hanya direkomendasikan untuk **pilot bervolume kecil** dengan **pencairan cepat (mingguan)** dan batas saldo maksimum per tenant. Kalau volume besar atau lambat, Model B (sub-account) jauh lebih sehat.

---

## 2. Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        WARGA (pembayar)                         │
│   Buka Smarthub → pilih tagihan → scan QRIS di m-banking/GoPay │
└──────────────────────────────┬──────────────────────────────────┘
                               │ bayar
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         XENDIT (Live)                           │
│   QRIS dinamis → dana masuk akun MASTER Logikraf               │
│   Webhook invoice.paid → POST https://logikraf.id/api/webhooks │
└──────────────────────────────┬──────────────────────────────────┘
                               │ webhook
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HUB (logikraf.id)                           │
│   Verifikasi callback token → teruskan ke Smarthub              │
│   external_id = sb-<invoice_number> (prefix tenant Smarthub)     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ webhook forward
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SMARTHUB (Go Fiber + PG)                      │
│   Terima webhook → set RLS context → tandai invoice lunas      │
│   payments → cash_ledgers (BANK_GATEWAY) → notif WA tenant     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ owner klik "Ajukan Pencairan"
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SETTLEMENT (Smarthub)                         │
│   Settlement pending → admin Logikraf proses → transfer manual  │
│   → upload bukti → tenant download → status paid                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Komponen yang Berubah vs yang Tetap

| Komponen | Status | Keterangan |
|---|---|---|
| Hub (logikraf.id) | **Tetap** | Single door Xendit; external_id prefix `sb-` |
| Smarthub backend | **Tambah** | webhook handler, settlement, fee engine |
| Smarthub frontend | **Tambah** | halaman Pembayaran & Pencairan di dashboard tenant |
| Database Smarthub | **Tambah tabel** | settlements, tenant_fee_settings, payout_requests |
| GoWA | **Tetap** | notifikasi WA sudah jalan |
| Xendit dashboard | **Tambah** | konfigurasi webhook URL (satu endpoint master) |

### 2.2 Multi-Tenant Isolation

Smarthub sudah memakai **RLS (Row-Level Security)** di PostgreSQL. Semua tabel baru wajib memuat kolom `tenant_id` dan policy RLS yang membatasi akses sesuai tenant. Context tenant di-set dari JWT claim saat request masuk (bukan dari body).

---

## 3. Alur End-to-End

### 3.1 Alur Pembayaran Warga

```
1. Bendahara/iuran: buat tagihan di Smarthub
   → invoices (status: UNPAID, due_date, amount, tenant_id)
   → invoice_items (rincian: iuran bulanan, CSR, dll)

2. Warga: buka halaman pembayaran Smarthub
   → pilih invoice → tombol "Bayar dengan QRIS"
   → POST /api/payments/qris { invoice_id }
   → hub.CreateQRIS(externalID="sb-<invoice_number>", amount, description)
   → Xendit buat QRIS dinamis → URL dikembalikan ke Smarthub

3. Warga: scan QRIS di aplikasi m-banking/GoPay/Dana
   → bayar → dana masuk akun master Logikraf

4. Xendit: webhook invoice.paid → hub → Smarthub
   → verifikasi signature (X-CALLBACK-TOKEN)
   → cari invoice by external_id
   → idempotency: cek payments.external_id sudah ada?
   → tandai invoice PAID
   → catat payment (channel=QRIS_DYNAMIC, amount, fee)
   → catat cash_ledger entry (IN, BANK_GATEWAY, bukti dari Xendit)
   → kirim WA ke tenant: "Pembayaran masuk: Rp X dari [nama]"

5. Dashboard tenant: saldo kas bertambah, invoice status PAID
```

### 3.2 Alur Pencairan Dana (Settlement)

```
1. Tenant: dashboard → menu "Pencairan" → lihat saldo tersedia
   → klik "Ajukan Pencairan" → pilih jumlah → submit
   → payout_requests (status: PENDING, tenant_id, amount)

2. Admin Logikraf: dashboard admin → antrian pencairan
   → klik "Proses" → status PROCESSING (locked)
   → transfer manual ke rekening tenant (bank transfer)
   → upload bukti transfer (foto/PDF)
   → klik "Tandai Terbayar" → status PAID

3. Tenant: lihat status PAID + download bukti
   → WA notifikasi: "Pencairan Rp X telah dibayar ke rekening [nama]"

4. Cash_ledger: catat OUT (BANK_GATEWAY, bukti upload)
```

### 3.3 Alur Kas Manual (Tunai)

```
1. Warga bayar tunai ke bendahara
2. Bendahara: input di Smarthub → cash_ledger (IN, MANUAL_CASH)
   → invoice bisa ditandai lunas manual (dengan bukti foto KTP/bukti transfer)
3. Alur pencairan sama seperti 3.2
```

---

## 4. Model Data

### 4.1 Tabel Baru

```sql
-- Settlements (pencairan dana tenant)
CREATE TABLE settlements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    amount          NUMERIC(15,2) NOT NULL,
    fee_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,  -- fee Logikraf yang dipotong
    net_amount      NUMERIC(15,2) NOT NULL,            -- amount - fee_amount
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','paid','cancelled')),
    bank_name       VARCHAR(100),
    account_number  VARCHAR(50),
    account_holder  VARCHAR(200),
    proof_file      VARCHAR(500),                       -- path bukti transfer
    processed_by    UUID REFERENCES admin_users(id),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Payout requests (alternatif nama, lebih konsisten dengan Smarthub)
CREATE TABLE payout_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    amount          NUMERIC(15,2) NOT NULL,
    fee_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_amount      NUMERIC(15,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','paid','cancelled')),
    settlement_id   UUID REFERENCES settlements(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Fee settings per tenant (override global)
CREATE TABLE tenant_fee_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    fee_flat        NUMERIC(15,2) NOT NULL DEFAULT 0,     -- per transaksi
    fee_percent     NUMERIC(5,4) NOT NULL DEFAULT 0,      -- persen dari amount
    monthly_fee     NUMERIC(15,2) NOT NULL DEFAULT 0,    -- langganan bulanan
    effective_from  TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Tabel yang Diubah

```sql
-- invoices: tambah kolom
ALTER TABLE invoices ADD COLUMN external_id VARCHAR(100);  -- sb-<number>
ALTER TABLE invoices ADD COLUMN qr_code_url VARCHAR(500);
ALTER TABLE invoices ADD COLUMN paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN channel VARCHAR(30);      -- QRIS_DYNAMIC, MANUAL_CASH

-- payments: tambah kolom
ALTER TABLE payments ADD COLUMN external_id VARCHAR(100);  -- dari Xendit
ALTER TABLE payments ADD COLUMN fee_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN settlement_id UUID REFERENCES settlements(id);
-- HAPUS UNIQUE(invoice_id) → ganti UNIQUE(external_id) untuk idempotency webhook

-- cash_ledgers: tambah kolom
ALTER TABLE cash_ledgers ADD COLUMN settlement_id UUID REFERENCES settlements(id);
ALTER TABLE cash_ledgers ADD COLUMN payment_id UUID REFERENCES payments(id);
```

### 4.3 Prefix Convention

| Entitas | Prefix | Contoh |
|---|---|---|
| Smarthub invoice (hub external_id) | `sb-` | `sb-INV-2026-0001` |
| Settlement | `stl-` | `stl-2026-09-001` |
| Payout request | `po-` | `po-2026-09-001` |

---

## 5. API Design

### 5.1 Endpoint Smarthub (Tenant-facing)

```http
POST   /api/v1/payments/qris                 — buat QRIS untuk invoice
GET    /api/v1/payments/:id                  — cek status pembayaran
GET    /api/v1/invoices                      — daftar invoice tenant
GET    /api/v1/invoices/:id                  — detail invoice
POST   /api/v1/invoices/:id/mark-paid        — tandai lunas manual (tunai)
GET    /api/v1/cash-ledgers                  — buku kas tenant
GET    /api/v1/settlements                   — riwayat pencairan
POST   /api/v1/settlements                   — ajukan pencairan
GET    /api/v1/settlements/:id               — detail pencairan + bukti
GET    /api/v1/fee-summary                    — ringkasan fee bulan ini
```

### 5.2 Endpoint Webhook (Hub → Smarthub)

```http
POST   /api/v1/webhooks/hub                  — menerima forward dari hub
```

Header: `X-Hub-Signature` (HMAC-SHA256, secret di env)

Payload (dari hub):
```json
{
  "event": "invoice.paid",
  "external_id": "sb-INV-2026-0001",
  "amount": 150000,
  "fee": 3000,
  "payment_method": "QRIS",
  "paid_at": "2026-09-23T10:00:00Z",
  "payer_email": "warga@email.com",
  "reference_id": "py-xxx"
}
```

### 5.3 Endpoint Admin (Logikraf)

```http
GET    /api/v1/admin/settlements             — antrian pencairan
POST   /api/v1/admin/settlements/:id/process — tandai processing
POST   /api/v1/admin/settlements/:id/paid     — upload bukti + tandai paid
GET    /api/v1/admin/fee-report               — laporan fee agregat
GET    /api/v1/admin/tenant-balances          — saldo per tenant
```

---

## 6. Settlement Flow

### 6.1 State Diagram

```
                    ┌──────────┐
                    │ PENDING  │ ← tenant ajukan
                    └────┬─────┘
                         │ admin klik "Proses"
                         ▼
                    ┌────────────┐
                    │ PROCESSING │ ← locked, tidak bisa dibatalkan
                    └─────┬──────┘
                          │ admin upload bukti + "Tandai Terbayar"
                          ▼
                    ┌──────────┐
                    │   PAID   │ ← dana diterima tenant
                    └──────────┘

    PENDING ──→ CANCELLED (tenant batalkan sebelum processing)
```

### 6.2 Aturan Bisnis

- **Minimum pencairan**: Rp 100.000 (hindari transfer kecil yang tidak efisien)
- **Maksimum pencairan**: saldo tersedia (tidak bisa melebihi)
- **Fee dipotong otomatis** saat settlement: `net_amount = amount - fee_amount`
- **Settlement berkala**: rekomendasi mingguan (setiap Senin) untuk mengurangi biaya transfer
- **Locking**: saat PROCESSING, amount di-freeze di saldo tenant (tidak bisa diajukan lagi)

### 6.3 Saldo Tersedia

```
available_balance = Σ(payments.amount) - Σ(settlements.amount WHERE status IN ('pending','processing','paid'))
```

---

## 7. Platform Fee Engine

### 7.1 Konfigurasi Fee

```json
{
  "fee_flat": 500,           // per transaksi
  "fee_percent": 0.005,      // 0.5% dari amount
  "monthly_fee": 100000,     // langganan bulanan
  "split_deduction": true    // split bulan ini mengurangi tagihan langganan
}
```

### 7.2 Perhitungan Fee per Transaksi

```go
func CalculateFee(amount float64, settings TenantFeeSettings) float64 {
    flat := settings.FeeFlat
    percent := amount * settings.FeePercent
    return flat + percent
}
```

Contoh: iuran Rp 150.000 → fee = 500 + (150.000 × 0,005) = 500 + 750 = **Rp 1.250**

### 7.3 Aturan Gabung Split + Langganan

```
1. Setiap transaksi: fee_flat + fee_percent dikumpulkan ke "pool split"
2. Akhir bulan: tagihan langganan = monthly_fee
3. Jika pool split >= monthly_fee → tagihan langganan = 0 (gratis bulan itu)
4. Jika pool split < monthly_fee → tagihan langganan = monthly_fee - pool split
5. Jika pool split > monthly_fee → sisa pool jadi kredit untuk bulan berikutnya
```

### 7.4 Perhitungan Contoh

| Bulan | Transaksi | Pool Split | Langganan | Tagihan Tenant | Kredit ke Bulan Berikutnya |
|---|---|---|---|---|---|
| Sep | 20 × Rp 150k | Rp 25.000 | Rp 100.000 | Rp 75.000 | 0 |
| Okt | 40 × Rp 150k | Rp 50.000 | Rp 100.000 | Rp 50.000 | 0 |
| Nov | 80 × Rp 150k | Rp 100.000 | Rp 100.000 | Rp 0 | 0 |
| Des | 100 × Rp 150k | Rp 125.000 | Rp 100.000 | Rp 0 | Rp 25.000 |

---

## 8. Webhook & Polling

### 8.1 Webhook (Utama)

Xendit → Hub (logikraf.id) → Smarthub

**Kenapa harus webhook (bukan polling)?**
- Real-time: invoice langsung lunas saat warga bayar
- Hemat resources: tidak perlu terus-menerus cek status
- Pola yang benar: hub sudah mendukung webhook (lihat skill logikraf-payment-hub)

**Idempotency:**
```go
// Cek sebelum proses
var existing Payment
err := db.Where("external_id = ?", payload.ReferenceID).First(&existing).Error
if err == nil {
    return nil // sudah diproses, abaikan
}
```

**Error handling:**
- Webhook gagal (timeout/5xx) → Xendit retry otomatis (exponential backoff)
- Smarthub harus return 200 untuk webhook yang valid signature-nya
- Untuk event yang tidak dikenali → return 200 `{"status":"ignored"}`

### 8.2 Polling (Fallback)

Jika webhook gagal atau untuk backup:

```go
// Cron: setiap 5 menit, cek invoice yang masih UNPAID
func PollPendingPayments() {
    invoices := db.Where("status = ?", "UNPAID").Find(&pending)
    for _, inv := range invoices {
        status := hub.Status(inv.ExternalID)
        if status.SudahLunas() {
            // sama seperti webhook handler
        }
    }
}
```

### 8.3 Webhook Security

```go
func VerifyWebhook(r *http.Request, body []byte) bool {
    token := r.Header.Get("X-CALLBACK-TOKEN")
    return subtle.ConstantTimeCompare([]byte(token), []byte(os.Getenv("HUB_CALLBACK_TOKEN"))) == 1
}
```

---

## 9. Rekonsiliasi

### 9.1 Rekonsiliasi Harian

```sql
-- Laporan harian: total pembayaran vs saldo cash_ledger
SELECT
    tenant_id,
    DATE(created_at) as date,
    SUM(amount) as total_payments,
    (SELECT SUM(amount) FROM cash_ledgers WHERE tenant_id = p.tenant_id AND DATE(created_at) = DATE(p.created_at) AND direction = 'IN') as ledger_in,
    (SELECT SUM(amount) FROM cash_ledgers WHERE tenant_id = p.tenant_id AND DATE(created_at) = DATE(p.created_at) AND direction = 'OUT') as ledger_out
FROM payments p
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY tenant_id, DATE(created_at);
```

### 9.2 Rekonsiliasi Bulanan

```go
// Cron: tanggal 1, kirim laporan ke admin Logikraf
func MonthlyReconciliation() {
    for _, tenant := range tenants {
        report := generateReport(tenant, lastMonth)
        if report.HasDiscrepancy() {
            alertAdmin("Selisih rekonsiliasi: " + tenant.Name)
        }
    }
}
```

### 9.3 Alert Kondisi Abnormal

| Kondisi | Alert | Tindakan |
|---|---|---|
| Saldo settlement > Rp 10 juta | WA ke admin | Segera proses pencairan |
| Selisih rekonsiliasi > Rp 50.000 | WA ke admin | Investigasi |
| Tenant tidak ada transaksi 30 hari | WA ke tenant | Cek apakah masih aktif |
| Fee bulanan belum terpakai | WA ke tenant | Ingatkan manfaat langganan |

---

## 10. Risiko & Mitigasi

### 10.1 Risiko Model A

| # | Risiko | Severitas | Mitigasi |
|---|---|---|---|
| 1 | Logikraf memegang uang kas pihak ketiga | **Tinggi** | Batas saldo maksimum per tenant (mis. Rp 5 juta); pencairan mingguan wajib; dokumen alur dana transparan |
| 2 | Nama merchant = Logikraf (bukan tenant) | Sedang | Komunikasi jelas di Smarthub: "Pembayaran ke Logikraf sebagai penyedia platform" |
| 3 | Rekening Logikraf diblokir → dana tenant terkunci | **Tinggi** | Rekening operasional terpisah dari rekening pribadi; backup rekening; SLA pencairan |
| 4 | Rekonsiliasi manual rawan selisih | Sedang | Rekonsiliasi harian otomatis; alert selisih; audit trail lengkap |
| 5 | Pajak: dana dianggap pendapatan Logikraf | **Tinggi** | Konsultasi dengan akuntan; pisahkan rekening operasional; catat settlement sebagai "dana yang dititipkan" bukan revenue |
| 6 | Volume besar → Model A tidak scalable | Sedang | Batasi pilot 3–5 tenant; setelah itu evaluasi Model B |

### 10.2 Kebutuhan Legal

- **Perjanjian penyelenggaraan** dengan tenant (format: kerjasama pengelolaan kas)
- **Kebijakan privasi**: dana warga ditangani oleh Logikraf
- **Laporan alur dana**: tenant bisa lihat semua alur masuk/keluar
- **Konsultasi pajak**: dana yang ditampung bukan pendapatan → tidak kena PPh

---

## 11. Roadmap Implementasi

### Fase 1: Pilot (2–3 minggu)

- [ ] Tabel baru (settlements, tenant_fee_settings, payout_requests)
- [ ] Webhook handler di Smarthub
- [ ] Halaman pembayaran tenant (buat QRIS, lihat status)
- [ ] Halaman pencairan tenant (ajukan, lihat riwayat)
- [ ] Admin settlement dashboard (proses, upload bukti)
- [ ] Fee engine (split per transaksi)
- [ ] Rekonsiliasi harian (cron)
- [ ] Unit test + integration test
- [ ] Deploy ke staging, uji end-to-end dengan 1 tenant

### Fase 2: Langganan & Rekonsiliasi (1–2 minggu)

- [ ] Fee langganan bulanan
- [ ] Aturan gabung split + langganan
- [ ] Rekonsiliasi bulanan otomatis
- [ ] Alert saldo & selisih
- [ ] Laporan pajak (export CSV)

### Fase 3: Go-Live (1 minggu)

- [ ] Migrasi data (invoice lama → external_id)
- [ ] Backup & rollback plan
- [ ] Monitoring & alerting
- [ ] Dokumen panduan tenant
- [ ] Uji beban (simulasi 100 transaksi)

---

## 12. Pertanyaan Terbuka untuk Xendit

Pertanyaan ini **harus** dikonfirmasi ke akun manager Xendit sebelum Fase 1:

1. Apakah pola "dana ditampung di master lalu diteruskan ke tenant" diperbolehkan untuk kasus iuran RT/RW?
2. Apakah ada batas volume/transaksi untuk model ini?
3. Apakah perlu perjanjian khusus (aggregation agreement)?
4. Bagaimana perlakuan pajak untuk dana yang ditampung (apakah dianggap pendapatan platform)?
5. Apakah ada biaya tambahan untuk volume tinggi (discount fee)?
6. Apakah webhook `invoice.paid` bisa dikirim ke URL khusus Smarthub (bukan hanya hub)?

---

## Lampiran

### A. Referensi

- `docs/payment-hub-integration-guide.md` — panduan integrasi hub
- `~/.hermes/skills/payment-gateway-integration/logikraf-payment-hub/` — skill hub
- `smarthub-v3/backend/internal/platform/hub/client.go` — klien hub
- `smarthub-v3/backend/migrations/0006_billing.sql` — skema billing

### B. Kontak

- **Pemilik proyek**: Nova
- **Tim tech**: Logikraf AI Studio
- **Akun manager Xendit**: [isi]
