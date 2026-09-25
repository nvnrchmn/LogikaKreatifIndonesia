# Hasil Analisis Payment Gateway - Logika Kreatif Indonesia

Dokumen ini berisi hasil penelusuran (scanning) terhadap implementasi Payment Gateway yang saat ini ada di dalam proyek Logika Kreatif Indonesia (Logikraf).

## 1. Konfigurasi dan Library yang Tersedia

Berdasarkan `composer.json` dan `config/payment.php`, terdapat beberapa Payment Gateway yang disiapkan:

- **Library Terinstal:**
  - `xendit/xendit-php` (^7.0)
  - `midtrans/midtrans-php` (^2.6)

- **Driver yang Terdaftar di Konfigurasi (`config/payment.php`):**
  - **Xendit** (Default driver jika tidak diset di `.env`)
  - **Midtrans**
  - **Tripay** (Hanya konfigurasi, belum ada implementasi class/gateway)

## 2. Implementasi Payment Gateway (Core)

Sistem menggunakan design pattern Factory/Interface (`PaymentGatewayInterface`) melalui `PaymentServiceProvider`.
- **XenditGateway** (`app/Services/Payment/XenditGateway.php`): Menggunakan Xendit Invoice API untuk membuat link pembayaran (Checkout).
- **MidtransGateway** (`app/Services/Payment/MidtransGateway.php`): Menggunakan Snap API untuk mendapatkan Snap Token.

Pengaturan *driver* yang aktif diatur secara dinamis melalui kolom `payment_gateway_driver` di tabel `settings` (model `Setting`) dengan *fallback* ke `xendit`.

## 3. Integrasi XenPlatform (Payment Hub)

Sesuai rencana penggunaan Xendit sebagai Payment Gateway utama untuk berbagai produk SaaS milik Logikraf, telah ditemukan implementasi awal **XenPlatform** (Payment Hub) di dalam proyek:

- **Sub-Account Creation (`Api\PaymentHub\SubAccountController`)**
  Terintegrasi dengan API Xendit (`/v2/accounts`) untuk membuat akun turunan (*sub-account*) dengan tipe `OWNED` bagi *business_name* / entitas SaaS yang tergabung. *(Catatan 2026-09: implementasi Go saat ini memakai `POST /v3/accounts` dengan `identity.entity_type=INDIVIDUAL` untuk tenant perorangan; tipe `OWNED` dibatasi untuk Indonesia. Endpoint `/v2/accounts` kini legacy.)*
- **Invoice & Disbursement**
  Terdapat controller `InvoiceController` dan `DisbursementController` pada *namespace* `PaymentHub` yang menandakan bahwa sistem juga telah memfasilitasi pembuatan invoice dan pencairan dana (*disbursement*) untuk masing-masing *sub-account*.
- **Routing Webhook Multi-Tenant (`XenditWebhookController`)**
  Webhook Xendit telah mendukung identifikasi transaksi dari Payment Hub. Jika referensi transaksi diawali dengan prefix `PHUB-{saasAppId}-{externalId}`, sistem akan mengidentifikasinya sebagai transaksi Payment Hub (`PhTransaction`), memperbarui statusnya, dan mem-forward data *webhook* tersebut ke aplikasi SaaS yang bersangkutan melalui `ForwardWebhookToSaasJob`.

## Kesimpulan

Sistem sudah memiliki fondasi yang kuat untuk mendukung **Xendit (XenPlatform)** sebagai Payment Hub (gateway utama). Routing multi-tenant (Sub-Account) dan *forwarding* webhook telah terstruktur dengan baik untuk melayani berbagai produk SaaS di bawah Logikraf, berdampingan dengan pembayaran reguler (milestone/order biasa) dan ketersediaan opsi Midtrans sebagai cadangan.
