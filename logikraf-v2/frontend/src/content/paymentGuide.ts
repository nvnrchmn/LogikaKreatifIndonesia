export const PAYMENT_GUIDE_MD = `# Panduan Payment Hub — Client Store & Portal Mitra

## 1. Konsep Alur Dana (2026-09-08)

Logikraf adalah **satu pintu (single-door)** pemrosesan pembayaran Xendit untuk
semua aplikasi client (tenant). Skema dana kini **XenPlatform Managed Sub-account**:

1. Client store punya **sub-account Xendit (Managed)** yang diundang dari dashboard
   XenPlatform akun Logikraf → KYC pemilik → status **LIVE**.
2. Aplikasi client tetap membuat invoice lewat Hub Logikraf
   (\`POST /api/client-store-invoices\` + \`X-Internal-Key\`).
   - Saat sub-account store **LIVE**, Hub membuat invoice **atas nama sub-account**
     (header \`for-user-id\`) → uang pembayaran masuk **saldo sub-account**, bukan master.
   - Sebelum LIVE (fallback), invoice tetap ke master Logikraf.
3. **Saldo & mutasi** mitra tampil di **portal mitra** (\`partners.logikraf.id\`):
   saldo, riwayat mutasi (pemasukan per invoice + penarikan), rekening bank tujuan.
4. **Penarikan** dilakukan mitra dari portal (Tarik Saldo → Payout Xendit \`for-user-id\`,
   butuh approval Money-out). Modul settlement/finance manual di MG & LKI **pensiun**.

Aplikasi client **tidak perlu** lagi menyediakan endpoint internal finance/settlement.

## 2. Checklist Setup Client Store Baru

### Langkah A — Siapkan aplikasi client (webhook pasif)
Aplikasi client hanya perlu menerima event dari Hub (status order/invoice):
- Endpoint webhook mis. \`/api/v1/webhook/xendit\`
- Verifikasi signature \`X-Logikraf-Signature\` (secret dari DB store) — optional
  bila aman via jaringan internal.

### Langkah B — Daftarkan store di Admin Logikraf
1. Buka \`logikraf.id/admin/partner-portal\` → kelola store & **akun login portal mitra**
   (email + password awal dibuat admin, mitra ganti sendiri).
2. **Sinkron dari Xendit** → pilih sub-account Managed → **Hubungkan ke mitra**.
   Otomatis terisi: \`sub_account_id\`, \`entity_type\`, status KYC.
3. Store di sisi routing (prefix \`mg-\`, webhook_url, secret) tetap dikelola
   lewat halaman **Mitra & Store** (form Nama Toko/Base URL/Generate Key).

### Langkah C — Pasang key di aplikasi client
- \`X-Internal-Key\` = key store (hanya tampil sekali saat generate/regenerate).
- Aplikasi client memakai key ini saat memanggil Hub (buat invoice).

### Langkah D — Aktifkan sub-account (XenPlatform)
- Undang owner sub-account (dashboard Xendit) → KYC owner (3–5 hari kerja,
  liveness tidak bisa diwakilkan) → status **Aktif/LIVE**.
- Klik **Sinkron dari Xendit** lagi → status store LIVE → invoice baru otomatis
  dibuat atas nama sub-account (lihat §1 poin 2).

## 3. Membuat Invoice Pembayaran (satu pintu)

### POST {hub}/api/client-store-invoices
Header: \`X-Internal-Key\` (key store), \`Content-Type: application/json\`.

\`\`\`json
{
  "external_id": "mg-ORD-123",
  "amount": 150000,
  "description": "Pesanan MG-20260908-0001",
  "payer_email": "pembeli@example.com",
  "success_redirect_url": "https://mg.logikraf.id/checkout/sukses",
  "failure_redirect_url": "https://mg.logikraf.id/checkout/gagal"
}
\`\`\`

Response sukses (200):
\`\`\`json
{
  "id": "6287b4f2ab2f0f3a1c4d5e6f",
  "external_id": "mg-ORD-123",
  "invoice_url": "https://checkout.xendit.co/web/xxxx",
  "status": "PENDING"
}
\`\`\`
Simpan \`id\` (xendit_invoice_id) + \`invoice_url\` untuk ditampilkan ke pembeli.

## 4. Webhook ke Aplikasi Client

Event Xendit masuk ke Hub → Hub meneruskan (forward) ke \`webhook_url\` store dengan
signature \`X-Logikraf-Signature\` (HMAC webhook_secret store). Aplikasi client
memperbarui status order dari event:
- \`invoice.paid\` → order **paid**
- \`invoice.expired\` → order **expired** (batal)
- dll.

Catatan: aplikasi client TIDAK perlu berkomunikasi langsung ke Xendit untuk
pembayaran — cukup via Hub + webhook.

## 5. Operasional Harian (portal mitra)

- Mitra login \`partners.logikraf.id\` → Dashboard/Saldo/Mutasi/Tarik Saldo/Rekening.
- Admin Logikraf memantau status sub-account & akun portal di
  \`logikraf.id/admin/partner-portal\` (sinkron manual saat ini; webhook
  \`account.verification\`/payout otomatis menyusul).
- Notifikasi WhatsApp mitra: status KYC berubah, payout diajukan/gagal.

## 6. Keamanan & Perawatan

- \`X-Internal-Key\` client→Hub: simpan di env aplikasi client, jangan di frontend.
- Jangan simpan API key Xendit di aplikasi client — semua lewat Hub.
- Kredensial & rahasia (JWT, webhook secret, API key) jangan pernah ditulis di
  config publik; nilai rahasia hanya di env server / DB settings.
- Saat menambah mitra baru: undang sub-account → KYC → LIVE → hubungkan → tes
  invoice kecil → portal saldo tampil → (setelah Money-out aktif) tes Tarik Saldo.
`
