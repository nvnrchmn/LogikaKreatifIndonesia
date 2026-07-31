# Panduan Integrasi Logikraf Payment Hub (XenPlatform)

Dokumen ini ditujukan bagi *developer* produk/SaaS di bawah naungan Logika Kreatif Indonesia (Logikraf) yang ingin mengintegrasikan sistem pembayarannya ke Payment Hub terpusat (XenPlatform).

## Base URL & Autentikasi

Semua *request* ke API Payment Hub harus ditujukan ke *Base URL* berikut:
```text
https://logikraf.id/api/payment-hub/v1
```

**Autentikasi:**
Gunakan *Header* `X-Logikraf-API-Key` di setiap *request*. API Key ini didapatkan dari *dashboard* Admin Logikraf saat SaaS Anda didaftarkan.

```http
X-Logikraf-API-Key: {API_KEY_ANDA}
Content-Type: application/json
Accept: application/json
```

---

## 1. Membuat Sub-Account (Penjual/Merchant)

Setiap *merchant* atau *tenant* di dalam SaaS Anda **wajib** dibuatkan *Sub-Account* sebelum mereka bisa menerima pembayaran atau mencairkan dana.

**Endpoint:** `POST /sub-accounts`

**Payload (JSON):**
```json
{
  "external_reference_id": "tenant-123",
  "business_name": "Toko Sejahtera",
  "email": "toko@sejahtera.com"
}
```
*Keterangan:*
- `external_reference_id`: ID unik merchant/tenant di database SaaS Anda. Digunakan sebagai referensi di setiap transaksi nanti.
- `business_name`: Nama bisnis yang akan muncul di rekening Xendit.

**Response (201 Created):**
Mengembalikan data `PhSubAccount` milik Logikraf, yang menandakan *sub-account* berhasil terdaftar.

---

## 2. Membuat Invoice (Checkout Pembayaran)

Gunakan *endpoint* ini ketika ada pelanggan (pembeli) yang ingin membayar pesanan ke salah satu *merchant/tenant* Anda.

**Endpoint:** `POST /invoices`

**Payload (JSON):**
```json
{
  "external_id": "ORDER-998877",
  "external_reference_id": "tenant-123",
  "amount": 50000,
  "payer_email": "pembeli@email.com",
  "description": "Pembayaran Pesanan Sepatu",
  "success_redirect_url": "https://saas-anda.com/order-success"
}
```
*Keterangan:*
- `external_id`: ID unik transaksi di database SaaS Anda (Tidak boleh duplikat).
- `external_reference_id`: ID *merchant* (dari proses pembuatan sub-account) yang akan menerima dana.
- `amount`: Nominal dasar tagihan (minimal 1000). *Note: Payment Hub akan secara otomatis menambahkan Platform Fee sesuai pengaturan SaaS Anda di dashboard Logikraf.*
- `success_redirect_url`: (Opsional) URL tujuan setelah pelanggan selesai membayar.

**Response (201 Created):**
```json
{
  "message": "Invoice created successfully",
  "data": {
    "transaction": { ... },
    "checkout_url": "https://checkout.xendit.co/web/..."
  }
}
```
Silakan *redirect* *user* ke `checkout_url` yang diberikan.

---

## 3. Cek Status Invoice

Meskipun sistem Logikraf akan secara otomatis mem-forward Webhook (jika dikonfigurasi), Anda tetap bisa mengecek status tagihan secara manual.

**Endpoint:** `GET /invoices/{external_id}`

Ganti `{external_id}` di URL dengan ID pesanan yang Anda buat saat pembuatan Invoice.

---

## 4. Pencairan Dana (Disbursement)

Pemilik *merchant* (*sub-account*) dapat menarik saldo mereka ke rekening bank lokal melalui endpoint ini.

**Endpoint:** `POST /disbursements`

**Payload (JSON):**
```json
{
  "external_id": "WD-00123",
  "external_reference_id": "tenant-123",
  "amount": 150000,
  "bank_code": "BCA",
  "account_holder_name": "BUDI SANTOSO",
  "account_number": "1234567890",
  "description": "Penarikan Dana Toko Sejahtera"
}
```
*Keterangan:*
- `external_id`: ID penarikan unik dari sistem SaaS Anda.
- `external_reference_id`: ID *merchant* yang saldonya akan ditarik.
- `amount`: Nominal penarikan (minimal Rp10.000).
- `bank_code`: Kode bank tujuan standar Xendit (contoh: BCA, MANDIRI, BRI, BNI).

---

## 5. Webhook Forwarding (Callback)

Jika transaksi Invoice atau Disbursement berhasil (PAID/SETTLED) di Payment Hub Logikraf, sistem akan mem-forward *payload webhook* secara utuh ke *Webhook URL* yang sudah didaftarkan (di-set saat pendaftaran SaaS di dashboard Admin).

Pastikan aplikasi SaaS Anda memiliki *endpoint* yang dapat menerima method `POST` untuk menangani *callback* ini. Logikraf meneruskan seluruh payload asli dari Xendit ke aplikasi Anda untuk diverifikasi secara mandiri.
