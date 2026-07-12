# Changelog: 12 Juli 2026 - Payment Hub (xenPlatform)

## Fitur Baru (Backend & API)
* **API Gateway Terpusat:** Menambahkan fitur Payment Hub terpusat berbasis REST API di bawah rute `/api/payment-hub/v1/`.
* **Keamanan API:** Mengimplementasikan Autentikasi API Key Kustom (`X-Logikraf-API-Key`) menggunakan *middleware* `SaasApiAuth`. Semua *request* dari aplikasi SaaS diwajibkan menyertakan *header* ini.
* **Integrasi Xendit xenPlatform:** 
  * Penambahan *endpoint* `/sub-accounts` untuk otomatisasi pendaftaran entitas warga (RT/RW) sebagai **Sub-Account Xendit**. Dana iuran warga kini langsung masuk ke rekening tujuan tanpa dipegang oleh Logikraf.
  * Penambahan *endpoint* `/invoices` untuk pembuatan tagihan warga dengan *support* kalkulasi `platform_fee_amount` secara dinamis pada saat eksekusi tagihan. Keuntungan SaaS otomatis dialokasikan ke rekening Master Logikraf.
* **Webhook & Queueing System:** Membangun arsitektur penerusan *webhook* (*forwarding*) ke aplikasi tujuan (seperti SB Digital) memanfaatkan fitur antrean (*queue*) Laravel (`ForwardWebhookToSaasJob`) untuk menjamin reliabilitas jika server SaaS *down*. 
* **Sistem Validasi Webhook HMAC:** Logikraf akan menandatangani *payload webhook* menggunakan HMAC SHA-256 (`X-Logikraf-Signature`) agar aplikasi SaaS dapat memastikan validitas dari Logikraf.
* **Modifikasi Webhook Xendit:** Memperbarui `XenditWebhookController` untuk menangkap tagihan dengan *prefix* `PHUB-` (tanda tagihan dari Payment Hub) dan merutekannya ke alur transaksi SaaS yang benar tanpa mengganggu transaksi utama (misalnya pesanan desain web).

## UI/UX & Admin Portal
* **Menu "SaaS Apps":** Halaman baru di Admin Portal (menggunakan Livewire) untuk manajemen registrasi produk ekosistem SaaS.
  * Fitur ini mampu menghasilkan API Key terenkripsi (otomatis) saat mendaftarkan aplikasi SaaS baru.
  * *Input field* khusus untuk mengonfigurasi Webhook URL dari setiap SaaS.
* **Menu "Payment Hub" (Buku Besar):** Halaman pemantauan (*ledger*) aliran dana sentral lintas SaaS. Menampilkan status pembayaran warga (*PENDING*, *LUNAS*, *EXPIRED*), Platform Fee yang diperoleh Logikraf, serta status keberhasilan penerusan *webhook*.
* **Menu "API Docs":** Dokumentasi interaktif (bergaya *developer-friendly* dengan tema gelap) berbahasa Indonesia yang dapat diakses langsung oleh tim dari dalam Admin Portal. Menggunakan *Alpine.js* untuk fitur *Copy-to-Clipboard* pada setiap contoh kode (*Request Headers*, *Body*, dan penanganan *Webhook*).

## Perbaikan Bug & Refactoring
* *Refactoring* komponen Livewire Volt menjadi komponen Livewire 3 standar untuk kompatibilitas dan stabilitas *routing* yang lebih kokoh pada `routes/web.php`.
* Penambahan migrasi *database* untuk relasi tabel `saas_applications`, `ph_sub_accounts`, dan `ph_transactions`.
