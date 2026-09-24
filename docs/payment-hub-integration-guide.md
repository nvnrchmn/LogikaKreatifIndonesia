# Panduan Integrasi Logikraf Payment Hub untuk Produk SaaS

> Dokumen ini menjelaskan cara mengintegrasikan produk SaaS (seperti Smarthub V3) ke dalam **Logikraf Payment Hub** — sistem pembayaran terpusat yang dikelola oleh PT Logika Kreatif Indonesia.

**Versi:** 1.0  
**Terakhir diperbarui:** 2026-09-22  
**Audience:** Developer produk SaaS di bawah naungan Logikraf

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Prasyarat & Registrasi](#2-prasyarat--registrasi)
3. [Autentikasi & Keamanan](#3-autentikasi--keamanan)
4. [Membuat Invoice (Checkout)](#4-membuat-invoice-checkout)
5. [QRIS Payment Request](#5-qris-payment-request)
6. [Webhook & Callback](#6-webhook--callback)
7. [Settlement & Pencairan Dana](#7-settlement--pencairan-dana)
8. [Platform Fee Engine](#8-platform-fee-engine)
9. [XenPlatform Managed Sub-Account](#9-xenplatform-managed-sub-account)
10. [Multi-Tenant Pattern (Smarthub)](#10-multi-tenant-pattern-smarthub)
11. [Best Practices & Pitfalls](#11-best-practices--pitfalls)
12. [Contoh Implementasi Lengkap](#12-contoh-implementasi-lengkap)
13. [Checklist Go-Live](#13-checklist-go-live)

---

## 1. Arsitektur Sistem

### Single-Door Architecture

Logikraf menggunakan **arsitektur satu pintu** (single-door) untuk semua pembayaran:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIKRAF PAYMENT HUB                         │
│                   (logikraf.id/logikraf-v2)                     │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Invoice   │  │    QRIS     │  │      Settlement         │ │
│  │   Engine    │  │   Engine    │  │      (Payout)           │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│  ┌──────┴────────────────┴──────────────────────┴─────────────┐ │
│  │              Xendit API (Verified Account)                  │ │
│  │         — One account, one webhook endpoint —               │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐
        │ MysticGlide│  │  Smarthub │  │  Store Lain│
        │  (MG)      │  │   (SB)    │  │            │
        └───────────┘  └───────────┘  └───────────┘
```

### Prinsip Utama

| Prinsip | Penjelasan |
|---------|------------|
| **Satu Key Xendit** | Seluruh ekosistem menggunakan satu API key Xendit milik Logikraf. Client app TIDAK PERNAH memegang key Xendit. |
| **Satu Webhook** | Semua callback Xendit masuk ke `https://logikraf.id/api/webhooks/xendit`, lalu di-route ke client store berdasarkan `external_id` prefix. |
| **Prefix Routing** | Setiap client store punya prefix unik (mis. `mg-`, `sb-`) untuk membedakan transaksi. |
| **Internal Auth** | Client app dan Hub saling autentikasi via header `X-Internal-Key` (symmetric secret). |

---

## 2. Prasyarat & Registrasi

### 2.1 Registrasi Client Store

Sebelum bisa menerima pembayaran, produk SaaS Anda harus terdaftar sebagai **Client Store** di dashboard Admin Logikraf:

1. Login ke `https://logikraf.id/admin`
2. Buka menu **Payment Hub** → **Client Stores**
3. Klik **[+ Tambah Client]**
4. Isi:
   - **Nama:** Nama produk (mis. "Smarthub V3")
   - **Prefix:** Kode unik (mis. `sb-`)
   - **Webhook URL:** Endpoint callback di app Anda (mis. `https://smarthub.logikraf.id/api/webhooks/xendit`)
5. **Internal Key** akan auto-generate (hex 24 byte). Simpan aman di env Anda.

### 2.2 Environment Variables

Tambahkan variabel berikut ke `.env` atau systemd `EnvironmentFile` aplikasi Anda:

```bash
# Payment Hub
LOGIKRAF_HUB_URL=https://logikraf.id
LOGIKRAF_INTERNAL_KEY=<internal-key-dari-dashboard>

# Opsional: fallback langsung ke Xendit (dev only, jangan di production)
# XENDIT_API_KEY=
# XENDIT_CALLBACK_TOKEN=
```

> ⚠️ **Jangan pernah hardcode key di source code.** Selalu via environment variables.

---

## 3. Autentikasi & Keamanan

### 3.1 Header Autentikasi

Setiap request ke Payment Hub harus menyertakan header:

```http
X-Internal-Key: <your-internal-key>
Content-Type: application/json
```

> **Catatan (2026-09-24):** implementasi live memakai `X-Internal-Key`. Nama lama
> `X-Logikraf-Internal-Key` pada versi awal dokumen **tidak dipakai** kode Hub dan
> hanya dipertahankan sebagai catatan historis.

### 3.2 Verifikasi Webhook Signature

Saat Logikraf meneruskan webhook ke app Anda, ia menyertakan **dua** header:

```http
X-Logikraf-Signature: <shared-secret-mentah>   # kompatibilitas lama
X-Logikraf-Signature-Hmac: <hmac-sha256-hex>   # cara aman (disarankan)
X-Logikraf-Store: <slug-store>
X-Logikraf-Tenant-Ref: <tenant-ref>            # untuk event akun/payout (tanpa external_id)
```

App Anda **WAJIB** memverifikasi `X-Logikraf-Signature-Hmac` untuk memastikan payload berasal dari Logikraf:

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
```

> Selama masa transisi, konsumen lama (mis. MysticGlide) masih menerima
> `X-Logikraf-Signature` berisi shared secret. Konsumen baru **wajib** memakai
> `X-Logikraf-Signature-Hmac`.

### 3.3 Constant-Time Comparison

Selalu gunakan constant-time comparison untuk membandingkan key/signature (tahan timing attack):

```go
import "crypto/subtle"

func VerifyInternalKey(provided, expected string) bool {
    return subtle.ConstantTimeCompare([]byte(provided), []byte(expected)) == 1
}
```

---

## 4. Membuat Invoice (Checkout)

### 4.1 Endpoint

```http
POST https://logikraf.id/api/client-store-invoices
```

### 4.2 Request Body

```json
{
  "external_id": "SB-INV-20260922-001",
  "amount": 150000,
  "payer_email": "warga@rt05.id",
  "given_names": "Budi Santoso",
  "description": "Iuran Bulan September 2026 - RT 05/RW 03",
  "success_redirect_url": "https://smarthub.logikraf.id/payment/success",
  "failure_redirect_url": "https://smarthub.logikraf.id/payment/failed",
  "metadata": {
    "product_subtotal": 150000,
    "store": "smarthub",
    "tenant_id": "tenant-abc-123"
  }
}
```

### 4.3 Validasi

| Field | Aturan |
|-------|--------|
| `external_id` | Harus diawali prefix store (case-insensitive). Untuk Smarthub: `sb-` |
| `amount` | Minimal Rp 1.000 |
| `metadata.product_subtotal` | Opsional. Digunakan untuk menghitung platform fee (basis = subtotal produk, bukan ongkir) |

### 4.4 Response (201 Created)

```json
{
  "id": "5f7b2c3a1d4e5f6a7b8c9d0e",
  "external_id": "SB-INV-20260922-001",
  "invoice_url": "https://checkout.xendit.co/web/5f7b2c3a1d4e5f6a7b8c9d0e",
  "amount": 150000,
  "status": "PENDING",
  "expiry_date": "2026-09-23T10:00:00.000Z"
}
```

### 4.5 Redirect User

Setelah mendapat `invoice_url`, redirect user ke sana:

```typescript
// Frontend (React)
window.location.href = response.invoice_url;
```

---

## 5. QRIS Payment Request

### 5.1 Endpoint

```http
POST https://logikraf.id/api/client-store-qris
```

### 5.2 Request Body

```json
{
  "external_id": "SB-QRIS-20260922-001",
  "amount": 75000,
  "description": "Iuran Bulan September 2026"
}
```

### 5.3 Response (201 Created)

```json
{
  "reference_id": "SB-QRIS-20260922-001",
  "external_id": "SB-QRIS-20260922-001",
  "qr_string": "000201010212...<EMV QR string panjang>",
  "amount": 75000,
  "expires_at": "2026-09-22T11:00:00.000Z",
  "simulate_allowed": false,
  "store": {
    "name": "Smarthub V3",
    "prefix": "sb-"
  }
}
```

### 5.4 Cek Status QRIS

```http
GET https://logikraf.id/api/payment/qris/:reference_id
```

Response:

```json
{
  "reference_id": "SB-QRIS-20260922-001",
  "status": "UNPAID",
  "amount": 75000,
  "paid_at": null
}
```

### 5.5 SSE Stream (Real-time Status)

```http
GET https://logikraf.id/api/payment/qris/:reference_id/stream
```

Gunakan EventSource di frontend untuk update real-time:

```typescript
const evtSource = new EventSource(`/api/payment/qris/${refId}/stream`);
evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.status === 'PAID') {
    // Update UI
    evtSource.close();
  }
};
```

### 5.6 Simulate Payment (Test Mode Only)

```http
POST https://logikraf.id/api/payment/qris/:reference_id/simulate
```

> ⚠️ **Hanya berfungsi saat `QRIS_MODE=test` atau `QRIS_ALLOW_SIMULATE=true`.** Pastikan env production `QRIS_ALLOW_SIMULATE=false`.

---

## 6. Webhook & Callback

### 6.1 Alur Webhook

```
Xendit → logikraf.id/api/webhooks/xendit
            ↓
      Hub verifikasi X-Callback-Token
            ↓
      Cari client store by prefix (external_id)
            ↓
      Forward payload ke client webhook_url
            ↓
      Client app update order → PAID
```

### 6.2 Payload yang Diterima Client App

```json
{
  "id": "5f7b2c3a1d4e5f6a7b8c9d0e",
  "external_id": "SB-INV-20260922-001",
  "status": "PAID",
  "amount": 150000,
  "paid_at": "2026-09-22T10:15:30.000Z",
  "payment_id": "pay-abc-123",
  "fees_paid_amount": 3000,
  "metadata": {
    "product_subtotal": 150000,
    "store": "smarthub"
  }
}
```

### 6.3 Implementasi Webhook Handler

```typescript
// Hono (Smarthub V3)
app.post('/api/webhooks/xendit', async (c) => {
  const signature = c.req.header('X-Logikraf-Signature-Hmac');
  const payload = await c.req.text();
  
  // 1. Verifikasi signature
  if (!verifySignature(payload, signature, process.env.LOGIKRAF_INTERNAL_KEY!)) {
    return c.json({ error: 'invalid signature' }, 401);
  }
  
  // 2. Parse payload
  const body = JSON.parse(payload);
  
  // 3. Hanya proses PAID/SETTLED
  if (body.status !== 'PAID' && body.status !== 'SETTLED') {
    return c.json({ status: 'ignored' });
  }
  
  // 4. Update order di DB (idempotent)
  const result = await db.update(orders)
    .set({ 
      status: 'paid', 
      paid_at: body.paid_at,
      payment_fee: body.fees_paid_amount || 0,
      xendit_invoice_id: body.id
    })
    .where(and(
      eq(orders.externalId, body.external_id),
      eq(orders.status, 'pending') // Hanya update jika masih pending
    ));
  
  // 5. Kirim notifikasi WA ke warga (async)
  if (result.rowsAffected > 0) {
    await notifyWargaPaid(body.external_id);
  }
  
  return c.json({ status: 'processed' });
});
```

### 6.4 Idempotency (Kritis!)

Webhook Xendit bisa dikirim berkali-kali. Pastikan handler Anda **idempotent**:

```sql
-- Hanya update jika status masih 'pending'
UPDATE orders 
SET status = 'paid', paid_at = :paid_at, xendit_invoice_id = :invoice_id
WHERE external_id = :external_id AND status = 'pending';
```

Jika tidak ada baris terupdate → ini duplicate, abaikan.

---

## 7. Settlement & Pencairan Dana

### 7.1 Arsitektur Settlement

```
Warga bayar → Dana masuk akun Logikraf (Xendit)
                    ↓
              Client app (Smarthub) mencatat revenue
                    ↓
              Owner lihat saldo di dashboard Smarthub
                    ↓
              Owner klik "Ajukan Pencairan"
                    ↓
              Logikraf transfer manual + upload bukti
                    ↓
              Owner download bukti di dashboard Smarthub
```

### 7.2 Internal Finance API (WAJIB disediakan Client App)

Client app harus expose endpoint berikut (di luar grup auth JWT):

```http
GET  /api/v1/internal/finance/summary
GET  /api/v1/internal/settlements
PATCH /api/v1/internal/settlements/:id/paid        (multipart: proof file)
PATCH /api/v1/internal/settlements/:id/processing
PATCH /api/v1/internal/settlements/:id/unlock
```

Semua endpoint diakses dengan header `X-Internal-Key`.

### 7.3 Finance Summary Response

```json
{
  "data": {
    "total_revenue": 15000000,
    "product_revenue": 14500000,
    "shipping_total": 500000,
    "pending_total": 2000000,
    "settled_total": 10000000,
    "outstanding": 3000000,
    "available_for_payout": 2500000,
    "xendit_fee_total": 300000,
    "net_revenue": 14700000
  }
}
```

### 7.4 Settlement Status Flow

```
PENDING → PROCESSING → PAID
   ↓          ↓
(dibatalkan) (gagal → unlock → PENDING)
```

| Status | Arti |
|--------|------|
| `pending` | Menunggu diproses Logikraf |
| `processing` | Sedang ditransfer (locked, tidak bisa dibatalkan) |
| `paid` | Dana sudah diterima owner + bukti tersedia |

---

## 8. Platform Fee Engine

### 8.1 Konsep

Logikraf mengenakan **biaya layanan platform** kepada client store:

| Komponen | Nilai (default) |
|----------|-----------------|
| Setup (sekali bayar) | Rp 1.500.000 |
| Biaya operasional bulanan | Rp 50.000 |
| Biaya layanan transaksi | 2% dari subtotal produk |
| Minimum bulanan | Rp 100.000 (3 bulan pertama dibebaskan) |
| Diskon volume | 1,5% (>Rp 25 jt/bln), 1% (>Rp 50 jt/bln) |

### 8.2 Cara Kerja

1. **Accrual:** Setiap transaksi PAID, hub otomatis mencatat fee ke tabel `platform_fees`.
2. **Basis fee:** `subtotal produk` (bukan ongkir). Kirim via `metadata.product_subtotal`.
3. **Rekap bulanan:** Fee transaksi + biaya operasional + minimum dihitung per bulan.
4. **Penagihan:**
   - **Mode Managed:** Fee dipotong otomatis saat pencairan dana.
   - **Mode LIVE:** Logikraf kirim invoice bulanan (jatuh tempo tgl 10).

### 8.3 Mengirim Product Subtotal

```json
{
  "external_id": "SB-INV-001",
  "amount": 160000,
  "metadata": {
    "product_subtotal": 150000,
    "shipping": 10000
  }
}
```

Fee 2% dihitung dari **150000** (bukan 160000).

### 8.4 Fee Reversal saat Refund

Jika order direfund, fee ikut dibalik:

```http
POST https://logikraf.id/api/client-store-fee-reverse
```

Body:

```json
{
  "external_id": "SB-INV-001"
}
```

---

## 9. XenPlatform Managed Sub-Account

### 9.1 Konsep

Setiap **tenant** di dalam client store bisa punya **sub-account Xendit sendiri** (KTP pemilik ≠ master), didaftarkan di tabel `client_sub_accounts` (kolom `store_id` + `tenant_ref`). Setelah KYC LIVE:

- Dana langsung masuk sub-account **tenant** (bukan akun induk), via header `for-user-id`
- Pencairan/settlement diinisiasi dari aplikasi SaaS (client store) lewat endpoint payout di §9.4
- Logikraf tetap potong fee otomatis

> **Arsitektur:** Logikraf = Master Account Xendit; produk SaaS (Smarthub) memetakan
> setiap tenant ke satu sub-akun `MANAGED`. Client app tidak pernah memegang kunci
> penyedia — semua panggilan memakai `X-Internal-Key` ke Hub.

### 9.2 Status KYC

| Status | Arti |
|--------|------|
| `INVITED` | Menunggu undangan KYC dari email |
| `AWAITING_DOCS` | Menunggu upload dokumen |
| `DRAFT` | Dokumen terupload, belum disubmit |
| `IN_REVIEW` | Sedang diverifikasi Xendit |
| `LIVE` | Verified, bisa terima pembayaran |
| `REJECTED` | Ditolak, perlu perbaiki dokumen |

### 9.3 Webhook XenPlatform

Hub menerima event berikut dari Xendit:

- `account.created`
- `account.verification`
- `payout.succeeded` / `payout.failed`
- `split_rule.created`

Event di-forward ke client app via webhook store (`X-Logikraf-Signature-Hmac`),
dengan header `X-Logikraf-Tenant-Ref` berisi `tenant_ref` pemilik sub-akun.

### 9.4 Endpoint Client Store (sub-akun per tenant)

Semua endpoint memakai `X-Internal-Key` (client store) dan memanggil Xendit atas
nama sub-akun tenant (`for-user-id`).

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/client-store/accounts` | Buat sub-akun `MANAGED` untuk `tenant_ref` (idempoten per tenant) |
| `GET`  | `/api/client-store/accounts/{id}` | Detail sub-akun + status KYC (alternatif `?tenant_ref=`) |
| `GET`  | `/api/client-store/balance?account_id=` | Saldo sub-akun (alternatif `?tenant_ref=`) |
| `GET`  | `/api/client-store/agreement` | Naskah perjanjian layanan `{version, text, hash}` untuk ditampilkan di UI |
| `POST` | `/api/client-store/kyc/files` | Unggah dokumen KYC (multipart, `purpose=KYC_DOCUMENT`) |
| `POST` | `/api/client-store/kyc/submit` | Submit verifikasi KYC (`account_verification`) + `consent` clickwrap |
| `POST` | `/api/client-store/payouts` | Payout ke rekening bank tenant (idempoten via `external_id`/`idempotency-key`) |
| `GET`  | `/api/client-store/payouts/{id}` | Status payout (`id` = provider id atau `external_id`) |

Contoh payout:

```json
POST /api/client-store/payouts
X-Internal-Key: <internal-key>

{
  "external_id": "sb-pencairan-33",
  "tenant_ref": "tenant-abc",
  "amount": 50000,
  "description": "Pencairan dana iuran RT",
  "recipient": {
    "bank_code": "BCA",
    "account_holder_name": "RT 05",
    "account_number": "1234567890"
  }
}
```

Status payout yang dikembalikan: `MENUNGGU`, `PROCESSING`, `SELESAI`, `GAGAL`
(dinormalisasi dari status provider; `DUPLICATE` diperlakukan idempoten).

> **Catatan implementasi (Xendit Payouts v3, `api-version: 2025-09-01`).** Hub
> menerjemahkan body ringkas di atas ke skema v3 (`recipient.account_details`,
> `payout_details`, `source_of_fund`, `purpose_code`) dan membaca `payout_id`
> (bukan `id`). `routing_type_1` bank Indonesia disetel via env
> `XENDIT_PAYOUT_ROUTING_TYPE` (default `BANK_CODE`) karena belum tercantum di
> enum global dokumentasi. Diperlukan API key berizin **MONEY-OUT**.

> **Catatan implementasi (Xendit Accounts v3).** Sub-akun dibuat via
> `POST /v3/accounts` dengan `identity {country_of_incorporation:"ID",
> entity_type:"INDIVIDUAL"}` dan `configuration.webhooks.recipient="MASTER_ACCOUNT"`.
> Individu hanya diizinkan sebagai sub-akun XenPlatform (sesuai catatan Xendit ID).

### 9.6 Pemetaan KYC (account_verification)

Hub memetakan input SmartHub ke `POST /account_verification` (Xendit) di dalam
`kyc_details`: alamat → `business_address`/`legal_entity_address`/`authorized_person_address`,
`data_usaha.sumber_dana` → `business_source_of_funds`, `rata_rata_transaksi_bulanan`
→ `business_average_monthly_basket_size`, `nama_penandatangan` → authorized/contact/stakeholder,
`files.*` → `authorized_person_identification` (type `ID_NATIONAL_ID_KTP`) +
`authorized_person_selfie_document`, dan consent → `service_agreement_document`.
Nilai yang belum dikumpulkan UI diambil dari env (opsional):
`XENDIT_KYC_MOBILE_NUMBER`, `XENDIT_KYC_MOBILE_COUNTRY_CODE` (default `+62`),
`XENDIT_KYC_ROLE` (default `BUSINESS_OWNER`), `XENDIT_KYC_INDUSTRY_CODE`,
`XENDIT_KYC_BUSINESS_REGISTRATION_NUMBER`, `XENDIT_KYC_BUSINESS_ESTABLISHMENT_DATE`,
`XENDIT_ACCOUNT_COUNTRY` (default `ID`), `PLATFORM_WEBSITE_URL`
(untuk `proof_of_business_websites`).

**Deployment live:** Hub = `https://logikraf.id` (callback Xendit di
`/api/webhooks/xendit` & `/api/webhooks/xendit/qris`); SmartHub =
`https://smarthub.logikraf.id`. Untuk store Smarthub, set
`ClientStore.WebhookURL = https://smarthub.logikraf.id/api/v1/billing/webhook`
dan `ClientStore.BaseURL = https://smarthub.logikraf.id`; set juga
`PLATFORM_WEBSITE_URL=https://smarthub.logikraf.id`.

### 9.5 Service agreement (clickwrap) pada KYC

Xendit tidak mewajibkan template tertentu; yang penting ada **bukti persetujuan
tenant**. Hub menggenerate PDF bukti persetujuan secara otomatis berisi:
identitas pendaftar, waktu persetujuan, IP, User-Agent, Log ID, hash naskah, dan
naskah perjanjian penuh. PDF diunggah ke `POST /files`, lalu `file_id`-nya
dilampirkan pada field `service_agreement_document` saat `POST /account_verification`.

Client store wajib:
1. Ambil naskah via `GET /api/client-store/agreement` (`{version, text, hash}`).
2. Tampilkan ke tenant dan minta centang "Setuju".
3. Kirim blok `consent` pada `POST /api/client-store/kyc/submit`:

```json
"consent": {
  "version": "v1",
  "hash": "<sha256 naskah>",
  "agreed_at": "2026-09-24T22:00:00+07:00",
  "ip": "203.0.113.10",
  "user_agent": "Mozilla/5.0 ...",
  "log_id": "consent-uuid",
  "signer_name": "Nama Penandatangan"
}
```

Versi/hash di luar naskah yang berlaku akan ditolak `422`.

---

## 10. Multi-Tenant Pattern (Smarthub)

### 10.1 Struktur Data Smarthub

Smarthub adalah SaaS multi-tenant (RT/RW). Setiap tenant = satu komplek perumahan.

```
Smarthub (SB)
├── Tenant A (RT 05/RW 03)
│   ├── Warga 1
│   ├── Warga 2
│   └── ...
├── Tenant B (RT 12/RW 01)
│   ├── Warga 1
│   └── ...
└── ...
```

### 10.2 Prefix Convention

Untuk membedakan transaksi antar-tenant di Smarthub:

```
sb-{tenant_id}-{type}-{timestamp}-{random}
```

Contoh:

```
sb-tenant-abc-inv-20260922-001
sb-tenant-xyz-qris-20260922-002
```

### 10.3 RLS (Row-Level Security)

Semua query ke PostgreSQL harus filter by `tenant_id`:

```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 10.4 Webhook Handler di Smarthub

Ketika webhook datang, Smarthub harus:

1. Verifikasi `X-Logikraf-Signature-Hmac`
2. Parse `external_id` → extract `tenant_id`
3. Set `app.current_tenant` session variable
4. Update invoice (idempotent)
5. Kirim notifikasi WA ke warga

---

## 11. Best Practices & Pitfalls

### 11.1 ✅ DO

| Praktik | Alasan |
|---------|--------|
| Selalu verifikasi `X-Logikraf-Signature-Hmac` | Mencegah pemalsuan webhook |
| Gunakan idempotency (`WHERE status='pending'`) | Mencegah double-processing |
| Kirim `metadata.product_subtotal` | Fee dihitung dari subtotal, bukan ongkir |
| Set `QRIS_ALLOW_SIMULATE=false` di production | Mencegah pelunasan palsu |
| Filter by `tenant_id` di semua query | Data isolation |
| Log semua webhook received | Audit trail |

### 11.2 ❌ DON'T

| Larangan | Alasan |
|----------|--------|
| Jangan hardcode Xendit key di client app | Key hanya milik Logikraf |
| Jangan tampilkan QR string < 150 chars | Placeholder, tidak bisa discan |
| Jangan update order tanpa cek status | Bisa overwrite status `paid` |
| Jangan hapus settlement `processing`/`paid` | Arsip permanen |
| Jangan trust `external_id` dari user | Selalu validate prefix server-side |

### 11.3 Common Pitfalls

#### 1. Prefix Validation Harus Case-Insensitive

```go
// SALAH
if !strings.HasPrefix(externalID, "sb-") { ... }

// BENAR
if !strings.HasPrefix(strings.ToLower(externalID), "sb-") { ... }
```

#### 2. Jangan Duplikasi Prefix

Jika nomor order sudah `SB-20260922-001`, jangan tambah prefix lagi jadi `sb-SB-20260922-001`.

#### 3. QRIS Tidak Bisa Refund via API

Kanal QRIS tidak support refund API. Gunakan alur manual:
1. Logikraf transfer manual ke warga
2. Upload bukti di dashboard
3. Order status → `refunded`

#### 4. Test Mode vs Live Mode

Jika QR string pendek (`some-random-qr-string`), penyebabnya:
- **Test Mode aktif** di dashboard Xendit, ATAU
- `QRIS_ALLOW_SIMULATE=true` di env

Jangan cari bug kode — cek dashboard Xendit dulu.

---

## 12. Contoh Implementasi Lengkap

### 12.1 Service Layer (TypeScript/Bun)

```typescript
// src/services/payment-hub.ts

const HUB_URL = process.env.LOGIKRAF_HUB_URL!;
const INTERNAL_KEY = process.env.LOGIKRAF_INTERNAL_KEY!;

export interface CreateInvoiceRequest {
  external_id: string;
  amount: number;
  payer_email?: string;
  given_names?: string;
  description?: string;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceResponse {
  id: string;
  external_id: string;
  invoice_url: string;
  amount: number;
  status: string;
  expiry_date: string;
}

export class PaymentHubService {
  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const res = await fetch(`${HUB_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': INTERNAL_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`PaymentHub ${res.status}: ${err.error || res.statusText}`);
    }

    return res.json();
  }

  async createInvoice(req: CreateInvoiceRequest): Promise<InvoiceResponse> {
    return this.request<InvoiceResponse>('POST', '/api/client-store-invoices', req);
  }

  async createQRIS(externalId: string, amount: number, description?: string) {
    return this.request('POST', '/api/client-store-qris', {
      external_id: externalId,
      amount,
      description,
    });
  }

  async getQRISStatus(referenceId: string) {
    return this.request('GET', `/api/payment/qris/${referenceId}`);
  }

  async reversePlatformFee(externalId: string) {
    return this.request('POST', '/api/client-store-fee-reverse', {
      external_id: externalId,
    });
  }
}

export const paymentHub = new PaymentHubService();
```

### 12.2 Webhook Handler (Hono)

```typescript
// src/routes/webhooks.ts

import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '../db';
import { invoices } from '../db/schema';
import { and, eq } from 'drizzle-orm';

const app = new Hono();

const HUB_SECRET = process.env.LOGIKRAF_INTERNAL_KEY!;

function verifySignature(payload: string, signature: string): boolean {
  const expected = createHmac('sha256', HUB_SECRET).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

app.post('/xendit', async (c) => {
  const signature = c.req.header('X-Logikraf-Signature-Hmac');
  const rawBody = await c.req.text();

  // 1. Verify
  if (!signature || !verifySignature(rawBody, signature)) {
    return c.json({ error: 'invalid signature' }, 401);
  }

  // 2. Parse
  const body = JSON.parse(rawBody);

  // 3. Only process PAID/SETTLED
  if (body.status !== 'PAID' && body.status !== 'SETTLED') {
    return c.json({ status: 'ignored', reason: `status=${body.status}` });
  }

  // 4. Idempotent update
  const result = await db
    .update(invoices)
    .set({
      status: 'paid',
      paidAt: new Date(body.paid_at),
      xenditInvoiceId: body.id,
      paymentFee: body.fees_paid_amount || 0,
      paidAmount: body.amount,
    })
    .where(
      and(
        eq(invoices.externalId, body.external_id),
        eq(invoices.status, 'pending')
      )
    )
    .returning();

  if (result.length === 0) {
    return c.json({ status: 'ignored', reason: 'already_paid_or_not_found' });
  }

  // 5. Async notifications (don't block webhook)
  const invoice = result[0];
  c.executionCtx.waitUntil(
    Promise.all([
      notifyWargaPaid(invoice),
      notifyBendaharaPaid(invoice),
    ])
  );

  return c.json({ status: 'processed', invoice_id: invoice.id });
});

async function notifyWargaPaid(invoice: any) {
  // Kirim WA ke warga: "Iuran Anda sudah dibayar..."
}

async function notifyBendaharaPaid(invoice: any) {
  // Kirim WA ke bendahara: "Pembayaran masuk Rp X..."
}

export default app;
```

### 12.3 Checkout Flow (Frontend)

```typescript
// src/hooks/useCheckout.ts

import { useState } from 'react';
import { api } from '../lib/api';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutWithInvoice = async (orderId: string, amount: number, tenant: any) => {
    setLoading(true);
    setError(null);

    try {
      const externalId = `sb-${tenant.id}-inv-${Date.now()}`;
      
      const res = await api.post('/api/payment/create-invoice', {
        external_id: externalId,
        amount,
        payer_email: tenant.userEmail,
        given_names: tenant.userName,
        description: `Iuran ${tenant.complexName} - ${tenant.currentPeriod}`,
        success_redirect_url: `${window.location.origin}/payment/success?ref=${externalId}`,
        failure_redirect_url: `${window.location.origin}/payment/failed?ref=${externalId}`,
        metadata: {
          product_subtotal: amount,
          tenant_id: tenant.id,
          store: 'smarthub',
        },
      });

      // Redirect to Xendit checkout
      window.location.href = res.invoice_url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkoutWithQRIS = async (orderId: string, amount: number, tenant: any) => {
    setLoading(true);
    setError(null);

    try {
      const externalId = `sb-${tenant.id}-qris-${Date.now()}`;
      
      const res = await api.post('/api/payment/create-qris', {
        external_id: externalId,
        amount,
        description: `Iuran ${tenant.complexName}`,
      });

      // Validate QR string length
      if (res.qr_string.length < 150) {
        throw new Error('QRIS belum bisa diterbitkan: akun pembayaran belum diverifikasi.');
      }

      // Redirect to QR payment page
      window.location.href = `/pay/qris/${res.reference_id}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { checkoutWithInvoice, checkoutWithQRIS, loading, error };
}
```

### 12.4 Reconciliation Cron

```typescript
// src/cron/reconcile-qris.ts

import { db } from '../db';
import { invoices } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { paymentHub } from '../services/payment-hub';

export async function reconcileQRIS() {
  // Cari invoice QRIS yang masih pending > 1 jam
  const pending = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.paymentMethod, 'qris'),
        eq(invoices.status, 'pending'),
        // created_at < NOW() - INTERVAL '1 hour'
      )
    )
    .limit(50);

  let paid = 0;
  let skipped = 0;
  let failed = 0;

  for (const inv of pending) {
    try {
      const status = await paymentHub.getQRISStatus(inv.externalId);
      
      if (status.status === 'PAID') {
        // Update to paid
        await db
          .update(invoices)
          .set({
            status: 'paid',
            paidAt: new Date(status.paid_at),
            paidAmount: status.amount,
          })
          .where(eq(invoices.id, inv.id));
        
        await notifyWargaPaid(inv);
        paid++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`Reconcile failed for ${inv.externalId}:`, err);
      failed++;
    }
  }

  if (pending.length > 0) {
    console.log(`Reconcile QRIS: checked=${pending.length}, paid=${paid}, skipped=${skipped}, failed=${failed}`);
  }
}
```

---

## 13. Checklist Go-Live

### Sebelum Go-Live

- [ ] Client Store terdaftar di dashboard Logikraf
- [ ] `LOGIKRAF_HUB_URL` dan `LOGIKRAF_INTERNAL_KEY` ter-set di env
- [ ] Webhook endpoint `/api/webhooks/xendit` bisa diakses dari internet
- [ ] Signature verification berfungsi
- [ ] Idempotency test passed (replay webhook → tidak double update)
- [ ] `metadata.product_subtotal` terkirim dengan benar
- [ ] `QRIS_ALLOW_SIMULATE=false` di production
- [ ] RLS aktif untuk semua tabel tenant
- [ ] Internal Finance API tersedia (untuk settlement)
- [ ] Notifikasi WA berfungsi (warga + bendahara)

### Saat Go-Live

- [ ] Test dengan pembayaran kecil (Rp 1.000 - Rp 10.000)
- [ ] Verifikasi order status berubah → `paid`
- [ ] Verifikasi webhook masuk di log
- [ ] Verifikasi notifikasi WA terkirim
- [ ] Cek dashboard Logikraf → transaksi muncul
- [ ] Cek platform_fee tercatat (jika applicable)

### Setelah Go-Live

- [ ] Monitor log error selama 24 jam
- [ ] Reconciliation cron berjalan (tiap 5 menit)
- [ ] Backup database berfungsi
- [ ] Dokumentasi internal di-update

---

## Referensi API Lengkap

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/client-store-invoices` | Buat invoice checkout |
| `POST` | `/api/client-store-qris` | Buat QRIS payment |
| `GET` | `/api/payment/qris/:ref` | Cek status QRIS |
| `GET` | `/api/payment/qris/:ref/stream` | SSE stream status |
| `POST` | `/api/payment/qris/:ref/simulate` | Simulasi bayar (test) |
| `POST` | `/api/client-store-refunds` | Refund invoice |
| `POST` | `/api/client-store-fee-reverse` | Balik platform fee |
| `POST` | `/api/client-store-invoices/:id/expire` | Force expire invoice |

---

## Kontak & Support

- **Dashboard Admin:** https://logikraf.id/admin
- **Payment Hub:** https://logikraf.id/admin/payment-hub
- **Technical Issue:** Hubungi tim Logikraf via WhatsApp

---

> 📝 **Catatan:** Dokumen ini bersifat living document. Update terakhir: 2026-09-22. Untuk perubahan API, lihat changelog di repository LogikaKreatifIndonesia.
