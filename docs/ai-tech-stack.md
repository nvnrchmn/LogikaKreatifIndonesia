# Tech Stack Specification: logikraf.id
**Project Type:** Corporate Website, Interactive Portfolio & Agnostic Transaction Hub
**Architecture Paradigm:** Monolithic Modern (TALL Stack) with Service-Driven Pattern
**Version:** 1.0 (Production Ready Spec)

---

## 1. Backend Core & Framework Layer

AI Coding Assistant wajib mengimplementasikan standard penulisan kode PHP modern berbasis Strict Typing pada layer ini.

- **Language:** PHP 8.3+ (Mengoptimalkan fitur *Readonly Classes*, *Typed Class Constants*, dan *Intersection Types*).
- **Framework:** Laravel 12
  - *Reasoning:* Menyediakan ekosistem yang matang untuk penanganan routing aman, database migration yang rapi, queue untuk asinkronus notifikasi, serta integrasi service interface yang fleksibel.
- **Dependency & Package Managers:** Composer.
- **Package Tambahan yang Diwajibkan:**
  - `spatie/laravel-permission` (Untuk penanganan Role & Permission Admin/Client).
  - `intervention/image` (Untuk kompresi otomatis aset gambar portofolio demi mengejar skor SEO/Lighthouse).

---

## 2. Frontend & Reactive Layer

Untuk menghindari kompleksitas pemisahan repositori (seperti menggunakan React/Vue yang terpisah API), website ini menggunakan pendekatan reaktif dalam satu *codebase*.

- **Framework Komponen:** Livewire v3
  - *Reasoning:* Memungkinkan pembuatan komponen *real-time* dan interaktif (seperti filter portofolio instan dan dynamic invoice builder) langsung di dalam ekosistem Laravel tanpa perlu menulis API endpoint terpisah.
- **Client-Side Scripting:** Alpine.js (Bawaan Livewire v3)
  - *Reasoning:* Digunakan khusus untuk interaksi UI yang bersifat lokal dan ringan (seperti membuka/menutup dropdown navbar, modul modal, dan mobile menu toggle) tanpa memicu request ke server.
- **CSS Framework:** Tailwind CSS v4
  - *Reasoning:* Menghasilkan berkas CSS produksi yang sangat kecil berkat fitur *Purging*, serta mempermudah implementasi *Responsive Design* (Mobile & Desktop).
- **Build Tool:** Vite (Laravel Mix pengganti).

---

## 3. Data & Storage Layer

- **Database Engine:** MySQL 8.0+
  - *Storage Engine:* InnoDB (Mendukung ACID Compliance dan Foreign Key Constraints ketat untuk modul transaksi).
- **Caching & Session:** File System.
- **File Storage:** Local (Untuk penyimpanan aset gambar portofolio beresolusi tinggi).

---

## 4. Payment Integration & External API Modul

- **Payment Gateway Interface:** Modul internal kustom berbasis Agnostic Contracts (`PaymentGatewayInterface`).
- **Supported Drivers:** Xendit PHP SDK atau Midtrans Core API (Dipanggil secara dinamis via environment variable).
- **Notification Services:** Mailgun / Brevo (Untuk pengiriman invoice digital) serta Slack Webhook / WhatsApp Business API Gateway (Untuk alert notifikasi prospek masuk).

---

## 5. Deployment & DevOps Stack (Target Environment)

- **Hosting:** DirectAdmin by Hostdata.id