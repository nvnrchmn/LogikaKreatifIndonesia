# Panduan Integrasi SB Digital dengan Logikraf Payment Hub (xenPlatform)

Dokumen ini berisi panduan teknis bagi tim pengembang SB Digital untuk menghubungkan sistem tagihan warga (iuran) ke **Logikraf Payment Hub**. 

Dengan menggunakan Logikraf Payment Hub, SB Digital tidak perlu mendaftar dan melakukan proses KYC ke pihak bank atau Xendit. Semua aliran dana warga akan otomatis dikelola secara legal dan aman, serta terpisah dari uang operasional.

---

## 1. Persiapan Awal

Sebelum memulai *coding*, pastikan Anda sudah mendapatkan hal berikut dari Admin Logikraf:
- **API Key Logikraf** (contoh: `sk_test_xxxxxx`).
- **Webhook URL** (Anda harus memberikan URL *endpoint* di SB Digital yang bisa menerima *request* POST dari Logikraf, contoh: `https://api.sbdigital.id/webhooks/logikraf-payment`).

---

## 2. Alur Pembayaran (Flow)

1. **Registrasi RT/RW:** Saat pengurus RT baru mendaftar di aplikasi SB Digital, sistem SB Digital akan menembak API Logikraf untuk membuatkan rekening penampung khusus (Sub-Account) untuk RT tersebut.
2. **Pembuatan Tagihan (Invoice):** Saat pengurus RT membuat tagihan iuran bulanan, sistem SB Digital menembak API Logikraf. Warga mendapat *link* Xendit Checkout.
3. **Warga Membayar:** Warga membayar tagihan (via VA, E-Wallet, QRIS).
4. **Distribusi Dana:** Uang secara otomatis terpecah. Biaya platform (misal: Rp 2.500) masuk ke Logikraf, sisanya murni masuk ke rekening Sub-Account milik RT tersebut.
5. **Webhook:** Logikraf mengirim notifikasi HTTP POST ke sistem SB Digital bahwa tagihan "LUNAS".
6. **Update Status:** SB Digital mengubah status tagihan warga di *database* menjadi lunas.

---

## 3. Dokumentasi API (Endpoints)

Semua *request* ke Logikraf harus menggunakan *header* berikut:
```http
Content-Type: application/json
Accept: application/json
X-Logikraf-API-Key: {API_KEY_ANDA}
```

### A. Membuat Sub-Account (Saat RT Baru Mendaftar)
Endpoint: `POST https://logikraf.id/api/payment-hub/v1/sub-accounts`

**Payload:**
```json
{
    "external_reference_id": "RT01-PERUM-MAWAR", // ID unik RT di database SB Digital
    "business_name": "Kas RT 01 Perum Mawar", // Nama yang akan muncul di rekening
    "email": "pengurus.rt01@example.com"
}
```

### B. Membuat Tagihan Iuran Warga
Endpoint: `POST https://logikraf.id/api/payment-hub/v1/invoices`

**Payload:**
```json
{
    "external_id": "INV-2026-001", // ID Tagihan di database SB Digital
    "external_reference_id": "RT01-PERUM-MAWAR", // ID RT yang didaftarkan di langkah A
    "amount": 50000, // Total tagihan warga
    "platform_fee_amount": 2500, // Keuntungan/potongan Logikraf
    "payer_email": "warga@email.com",
    "description": "Iuran Kebersihan Juli"
}
```
*Sistem Logikraf akan merespons dengan `checkout_url` yang harus Anda berikan kepada warga untuk dibayar.*

---

## 4. Menangkap Webhook (Konfirmasi Pembayaran)

Ketika warga sukses membayar, Logikraf akan mengirim POST ke Webhook URL Anda.

**Contoh Payload Webhook dari Logikraf:**
```json
{
    "event": "invoice.paid",
    "external_id": "PHUB-1-INV-2026-001", 
    "status": "PAID",
    "paid_amount": 50000
}
```

**Kode PHP/Laravel untuk menangkap Webhook di SB Digital:**

```php
public function handleLogikrafWebhook(Request $request) 
{
    // 1. Ambil Signature untuk keamanan
    $signature = $request->header('X-Logikraf-Signature');
    $expectedSignature = hash_hmac('sha256', $request->getContent(), env('LOGIKRAF_WEBHOOK_SECRET'));
    
    if (!hash_equals($expectedSignature, $signature)) {
        abort(403, 'Invalid signature');
    }

    $payload = $request->all();

    // 2. Logikraf menambahkan prefix "PHUB-{SaasID}-" di depan ID Anda. 
    // Mari kita pecah untuk mendapatkan ID Tagihan asli milik SB Digital.
    $parts = explode('-', $payload['external_id'], 3);
    $sbDigitalInvoiceId = $parts[2]; // Hasil: "INV-2026-001"

    // 3. Update database SB Digital
    if ($payload['status'] === 'PAID') {
        $invoice = Invoice::where('invoice_code', $sbDigitalInvoiceId)->first();
        if ($invoice) {
            $invoice->update(['status' => 'LUNAS', 'paid_at' => now()]);
        }
    }

    return response()->json(['status' => 'ok']);
}
```

---
*Dokumen ini bersifat internal dan rahasia.*
