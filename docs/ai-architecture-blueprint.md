# AI Dev Reference: Website Architecture & Technical Blueprint
**Project:** logikraf.id (PT. Logika Kreatif Indonesia)  
**Target Stack:** Laravel 12, Tailwind CSS v4, Alpine.js, Livewire v3 (TALL Stack)
**Environment:** DirectAdmin Hosting (Hostdata.id)
**Version:** 2.2 (Updated Local Storage & Caching Spec)

---

## 1. Core System & Tech Stack Rules

Dokumen ini adalah instruksi blueprint teknis bagi **AI Coding Assistant / Agent** untuk membangun website **logikraf.id** dari nol. AI harus mematuhi standar arsitektur lokal berikut tanpa perkecualian.

### 1.1 Stack Specification
- **Backend Framework:** Laravel 12 (Strict Type Hinting, Return Types declared).
- **Frontend Engine:** Livewire v3 & Alpine.js untuk interaksi client-side ringan.
- **Styling:** Tailwind CSS v4 (Menggunakan arsitektur native CSS-based configuration terbaru).
- **Database:** MySQL 8.0+ (Engine: InnoDB, Charset: utf8mb4).
- **Drivers:** Caching & Session diatur menggunakan `file` driver bawaan Laravel. Storage diatur menggunakan `local` disk.

### 1.2 Architecture Pattern
- Wajib menggunakan **Service-Repository Pattern** atau **Action Pattern** untuk memisahkan Business Logic dari Controller jika logic melebihi 3 baris.
- Seluruh rute admin wajib dilindungi menggunakan middleware bawaan `auth` dan kustom middleware `role:admin`.

---

## 2. Agnostic Payment Gateway Module Architecture

Bagian ini mendefinisikan modul pembayaran modular. Sistem harus dirancang agar *payment gateway* vendor apa pun (Xendit, Midtrans, Tripay, dll.) bisa dipasang/diganti hanya dengan mengubah konfigurasi `.env` tanpa mengubah kode pada Controller Utama.

### 2.1 The Contract (Interface)
AI harus membuat interface dasar di `app/Contracts/PaymentGatewayInterface.php`:

<?php

namespace App\Contracts;

use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Membuat invoice/charge ke Payment Gateway.
     * @return array{payment_url: string, reference_id: string, raw_response: array}
     */
    public function createTransaction(Order $order): array;

    /**
     * Memvalidasi dan mengekstrak data dari Webhook callback vendor.
     * @return array{order_id: string, status: string, signature_valid: bool}
     */
    public function handleWebhook(Request $request): array;
}


### 2.2 Dynamic Service Binding
AI harus mendaftarkan gateway manager di app/Providers/PaymentServiceProvider.php untuk membaca driver secara dinamis dari .env:

<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Contracts\PaymentGatewayInterface;
use App\Services\Payment\XenditGateway;
use App\Services\Payment\MidtransGateway;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentGatewayInterface::class, function ($app) {$driver = config('payment.default_driver', 'xendit');

            return match ($driver) {
                'xendit' => new XenditGateway(),
                'midtrans' => new MidtransGateway(),
                default => throw new \InvalidArgumentException("Payment driver [{$driver}] tidak didukung."),
            };
        });
    }
}


### 3. Database Schema Blueprint
AI harus men-generate struktur migration database dengan relasi ketat sebagai berikut:
[users] 1 ------ N [orders] 1 ------ 1 [transactions]

3.1 Migration Code Schemas
Tabel services (Manajemen Layanan Agency)
PHP
Schema::create('services', function (Blueprint $table) {
    $table->id();$table->string('slug')->unique();
    $table->string('name');$table->text('description');
    $table->enum('category', ['software', 'uiux', 'marketing', 'branding']);$table->unsignedBigInteger('base_price')->default(0); 
    $table->boolean('is_active')->default(true);$table->timestamps();
});
Tabel orders (Pemesanan Project / Layanan)
PHP
Schema::create('orders', function (Blueprint $table) {$table->id();
    $table->string('order_number')->unique(); // Format: LK-YYYYMMDD-XXXX$table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('service_id')->constrained();$table->string('project_name');
    $table->text('project_brief');$table->unsignedBigInteger('total_amount');
    $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');$table->timestamps();
});
Tabel transactions (Log Pembayaran Agnostic)
PHP
Schema::create('transactions', function (Blueprint $table) {
    $table->id();$table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->string('transaction_reference')->unique();$table->string('payment_method')->nullable(); 
    $table->unsignedBigInteger('amount');$table->enum('status', ['pending', 'settlement', 'expired', 'failed'])->default('pending');
    $table->string('payment_url')->nullable();$table->json('raw_gateway_response')->nullable();
    $table->timestamp('settled_at')->nullable();$table->timestamps();
});

---
### 4. Local File Storage Security Rules
Karena platform menggunakan penyimpanan lokal di hosting DirectAdmin:

- AI wajib menggunakan Intervention Image untuk memproses resize dan enkapsulasi ekstensi berkas portofolio ke format .webp sebelum menyimpannya ke direktori storage/app/public/portfolios/.
- AI harus memastikan kode program melakukan hapus berkas fisik secara otomatis di server lokal (Storage::disk('public')->delete($path)) jika data portofolio terkait dihapus dari database.

---
### 5. Security Guardrails
Saat mengembangkan kode untuk logikraf.id, AI dilarang keras:

- Menyimpan API Key atau Client Secret Payment Gateway langsung di dalam kode class. Semua wajib dipanggil via config() yang merujuk pada .env.
- Membiarkan endpoint Webhook Payment Gateway terbuka tanpa verifikasi IP atau Signature Matching yang divalidasi oleh method handleWebhook().

---
### 6. File Upload & Management Rules
Karena aplikasi akan di-deploy di server hosting dengan environment **DirectAdmin**, AI harus mematuhi aturan manajemen file lokal berikut:
- **Storage Location:** Seluruh file upload (Portofolio Images, User Avatars, etc.) wajib disimpan di dalam direktori `./storage/app/public/`. Jangan menggunakan folder `public/uploads` agar tidak bentrok dengan sistem file hosting.
- **Intervention Image Required:** Wajib menggunakan package `intervention/image` untuk resize, kompresi (WEBP conversion), dan optimasi file sebelum disimpan. File original tidak boleh disimpan tanpa di-proses (kecuali dibutuhkan).
- **Symbolic Link (Symlink):** Saat deployment, AI wajib mengingatkan user (melalui file `DEPLOYMENT_GUIDE.md`) untuk menjalankan perintah `php artisan storage:link` via SSH atau menggunakan fitur *Symbolic Link* di panel DirectAdmin agar folder storage bisa diakses publik.
- **Cleanup Logic:** Saat data dihapus di database (Delete Portofolio, Delete User), AI harus memastikan kode secara otomatis menghapus file fisiknya dari server (`unlink()` atau `Storage::delete()`) untuk mencegah penyimpanan file sampah yang menghabiskan kuota hosting.

---

### 7. Cron Job Management Rules
Karena hosting menggunakan **DirectAdmin** dengan environment **shared/cloud hosting**, AI harus mengatur jadwal pekerjaan terjadwal (Cron Jobs) sesuai dengan batasan eksekusi server.
- **Scheduling Method:** Wajib menggunakan sintaks Cron sederhana `* * * * *` agar bisa di-setting melalui fitur "Cron Jobs" di panel DirectAdmin. Hindari penggunaan `php artisan schedule:work` atau *scheduler* internal Laravel yang membutuhkan daemon aktif.
- **Task List:**
    1.  **Email Dispatcher:** Menjalankan task `php artisan queue:work --tries=3` atau *driver* Queue sederhana berbasis file/database untuk mengirim notifikasi email leads (jika menggunakan Mail Driver default).
    2.  **Update Status Transaksi:** Menjalankan task `php artisan check:transactions` (kustom) untuk melakukan query ke API Payment Gateway guna memverifikasi status pembayaran (Settlement/Failed/Expired) berdasarkan reference ID yang disimpan, lalu meng-update status di tabel `transactions`.
    3.  **Image Optimization Cleanup:** Menjalankan task khusus untuk membersihkan file gambar lama yang tidak terpakai di direktori storage (jika ada fitur cache/versioning).
- **Best Practice:** AI harus memastikan setiap task Cron berjalan < 10 detik. Jika proses memakan waktu lama, pisahkan menjadi beberapa task kecil atau gunakan Queue System berbasis database.

---

### 8. API Security Rules
Untuk menjaga keamanan aplikasi di lingkungan shared hosting, AI harus menerapkan protokol keamanan berikut pada setiap endpoint yang terpapar publik.
- **Rate Limiting:** Wajib mengimplementasikan rate limiting pada endpoint kritis (seperti login, register, dan form pengajuan proyek) untuk mencegah serangan brute-force atau penyalahgunaan bot.
- **Input Validation:** Selalu menggunakan Form Requests untuk validasi data input. Jangan pernah memvalidasi data langsung di dalam Controller atau Livewire Component.
- **CSRF Protection:** Memastikan setiap form HTML dilengkapi dengan directive `@csrf` dari Laravel. Jangan menonaktifkan middleware CSRF pada endpoint publik yang menerima input user.
- **Sensitive Data Exposure:** Dilarang keras menyertakan atau mencetak (dump) variabel sensitif (seperti API Keys, Secrets, atau Password Hash) ke dalam response JSON atau halaman frontend. Jika terjadi error, tampilkan pesan generik kepada user dan log detailnya ke log server (storage/logs).
- **Webhook Security:** Khusus pada endpoint Webhook Payment Gateway, AI wajib mengimplementasikan IP Whitelisting (jika memungkinkan) dan Signature Verification untuk memastikan data berasal dari sumber resmi payment gateway, bukan dari pihak ketiga yang iseng.

---

## 9. API Documentation Rules
Karena aplikasi ini akan dibangun dengan model B2B dan berpotensi dikembangkan menjadi Platform-as-a-Service (PaaS) di masa depan, AI harus menerapkan dokumentasi API yang terstruktur dan profesional sejak awal.
- **Swagger/OpenAPI Specification:** AI wajib membuat file spesifikasi `openapi-specification.yaml` (atau setara) untuk mendokumentasikan semua endpoint publik, parameter input, dan struktur response (Success 200, Error 4xx/5xx).
- **Documentation Endpoint:** Mengaktifkan fitur dokumentasi interaktif (seperti Swagger UI atau Redoc) yang dapat diakses pada route khusus (misalnya `/api/docs`) agar developer eksternal atau tim QA dapat dengan mudah menguji endpoint yang tersedia.
- **Security Documentation:** Mendokumentasikan dengan jelas bagaimana otentikasi bekerja (terutama untuk endpoint Admin), limitasi rate (rate limiting), dan prosedur keamanan Webhook pada file dokumentasi teknis.
- **Version Control:** Menyimpan file spesifikasi ini di dalam repositori kode (misalnya di folder `/docs`) bersamaan dengan kode sumber agar dokumentasi selalu sinkron dengan perubahan fitur.

---
