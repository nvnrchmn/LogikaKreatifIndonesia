# ADR-005: Multi-Tenant Payment Hub

**Status:** Accepted & Implemented (terverifikasi di production logikraf.id)
**Tanggal:** 2026-08-12
**Pemilik:** Logika Kreatif Indonesia (Logikraf)

---

## 1. Context

SB Digital (dan tenant lain seperti perumahan/ komunitas) butuh menerima pembayaran
(IPL, paket, dsb) dengan **pemisahan dana per tenant**. Logikraf berperan sebagai
**payment orchestrator**, bukan penampung dana.

Pertanyaan kritis sebelum implementasi:
> "Apakah Midtrans memberikan model merchant/sub-merchant yang memungkinkan Logikraf
> onboard banyak tenant, masing-masing dengan settlement account sendiri?"

**Jawaban (dari docs Midtrans resmi via firecrawl):** YA. Midtrans punya model
**Partner account** (platform seperti Logikraf) yang mengelola banyak **Merchant ID**
dalam 1 Partner ID. Tiap Merchant = tenant, settlement ke rekening masing-masing.

---

## 2. Decision

Gunakan **Model #2: Multi-akun mandiri** untuk MVP (sudah jalan & terverifikasi):

- Tiap tenant = merchant account sendiri, **Server Key** disimpan di `settings` per tenant.
- Checkout memakai Server Key tenant → settlement langsung ke rekening tenant.
- Logikraf **tidak menampung dana** — hanya mencatat ledger, fee, dan rekonsiliasi.
- Dana flow: Warga → SB Digital → Logikraf Payment Hub → Merchant Tenant (Midtrans/Xendit) → Settlement → Rekening Tenant.

**Skala (scale path, bukan MVP):** Migrasi ke model **Marketplace/Partner** Midtrans
(1 akun Partner, sub-merchant via KYC API) kalau jumlah tenant besar & butuh auto-split fee.
Butuh pengajuan akun tier Partner ke Midtrans.

---

## 3. Multi-Tenancy Model

Tenant di-resolve dari **domain** (`c.Host()`), bukan dari login:

```
tenantOf(c) = host tanpa port/www  →  "logikraf.id", "sbdigital.biz.id"
```

Semua config di-resolve via `setting(key, tenant)` dengan composite PK `(tenant, key)`.
Root-cause isolation ada di 1 fungsi → semua caller (payment, gateway, webhook) ikut ter-isolate.

Webhook (Midtrans/Xendit) di-resolve by **signature/token match** ke `settings` row
(karena Host webhook = server gateway, bukan tenant domain).

---

## 4. Database Schema

### `settings` (composite PK: tenant + key)
| key | keterangan |
|---|---|
| `midtrans_server_key` | Server Key tenant (rahasia) |
| `midtrans_client_key` | Client Key tenant |
| `midtrans_env` | `sandbox` \| `production` |
| `xendit_secret_key` | Secret Key Xendit |
| `xendit_public_key` | Public Key Xendit |
| `xendit_webhook_token` | Token verifikasi webhook Xendit |
| `midtrans_fee_percent` / `midtrans_fee_flat` | Fee provider Midtrans |
| `xendit_fee_percent` / `xendit_fee_flat` | Fee provider Xendit |
| `platform_fee_percent` | Fee Logikraf |
| `payment_gateways` | JSON array gateway aktif, e.g. `["midtrans","xendit"]` |
| `company_name` / `company_email` / `company_phone` / `company_address` | Profil (per tenant) |

### `tenant_payment_accounts`
`id, tenant_id, provider, merchant_id, merchant_reference, status, settlement_status, created_at, updated_at`
- `status`: `PAYMENT_NOT_CONFIGURED | ONBOARDING | UNDER_REVIEW | ACTIVE | SUSPENDED`
- Di-set `ACTIVE` otomatis saat checkout pertama sukses.

### `payment_transactions` (ledger)
`id, tenant_id, payment_account_id, invoice_ref, provider, provider_tx_id, order_id,
gross_amount, provider_fee, platform_fee, net_amount, status, paid_at, settled_at, created_at, updated_at`
- `status`: `pending | paid | settled | refunded | failed`
- `net_amount = gross_amount - provider_fee - platform_fee` (hak tenant)

---

## 5. API Endpoints

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/payment-gateways` | public (Host) | Gateway aktif + policies per tenant |
| POST | `/api/payment/midtrans/snap` | public (Host) | Buat Snap → redirect_url, tulis ledger+fee, set ACTIVE |
| POST | `/api/payment/xendit/invoice` | public (Host) | Buat invoice Xendit, tulis ledger+fee, set ACTIVE |
| POST | `/api/webhooks/midtrans` | public | Signature sha512 verify, update ledger settled |
| POST | `/api/webhooks/xendit` | public | X-Callback-Token verify, update ledger settled |
| GET | `/api/tenant-payment-accounts` | admin (tenant) | Status onboarding merchant |
| GET | `/api/payment-transactions` | admin (tenant) | Ledger per tenant |
| POST | `/api/payment-transactions/:id/refund` | admin (tenant) | Refund (branch provider), mark refunded |
| GET | `/api/payment-reconciliation` | admin (tenant) | Summary gross/fee/net/by_status |

---

## 6. Fee Engine

```go
calcFee(gross, percentStr, flatStr) uint
// percent float "2.9", flat integer rupiah "5000"
// fee = gross*percent/100 + flat
// net = gross - providerFee - platformFee
```

Fee di-lock saat **create** checkout (bukan saat webhook). Admin atur %/flat di
`/admin/settings` (input number, bukan password).

---

## 7. Frontend (Admin)

| Route | Page | Isi |
|---|---|---|
| `/admin/merchant-accounts` | TenantPaymentAccountsPage | Status lifecycle merchant per provider |
| `/admin/payment-ledger` | PaymentLedgerPage | Tabel fee breakdown + tombol Refund |
| `/admin/reconciliation` | ReconciliationPage | Summary card (gross/fee/net/status) |
| `/admin/settings` | SettingsPage | Card Payment Gateway: toggle + key + fee inputs |

**Konvensi:** NO modal untuk CRUD (kecuali konfirmasi). `apiPut`/`apiPost` wajib kirim
Bearer token (fetch polos → 401 silent).

---

## 8. Verification (real, not simulated)

- Multi-tenant isolation: `Host: logikraf.id` → Midtrans aktif; `Host: sbdigital.biz.id` → `[]` (key kosong). ✓
- Checkout Midtrans sandbox → redirect_url asli dari Midtrans. ✓
- Ledger: gross 300000, fee 2.9%+5000 + platform 1% → net 283300. ✓
- Webhook: signature verify → ledger `settled` + `settled_at`. ✓
- Xendit webhook PAID → ledger `settled`. ✓
- Refund: Midtrans & Xendit → ledger `refunded`. ✓
- Reconciliation: logikraf.id → count 4, gross 950000, net 622450. ✓
- Browser: semua page render & interaktif (screenshot verified). ✓

---

## 9. Skipped (scale, bukan MVP)

- Provider-side reconciliation pull (paging API Midtrans/Xendit).
- Xendit real `/refunds` payout (MVP pakai `/expire` cancel).
- KYC Partner onboarding API (butuh akun tier Partner).
- Partial refund.
- Tenant Wallet (dIHAPUS dari blueprint — dana langsung settlement).

---

## 10. References

- Midtrans docs: https://docs.midtrans.com/llms.txt (Partner vs Merchant account)
- firecrawl terinstall di venv Hermes (`/usr/local/lib/hermes-agent/venv`) untuk web tools.
- Skill: `logikraf-payment-hub` (ringkasan teknis untuk agent).
