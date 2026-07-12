# Update 2026-07-12: Dynamic Platform Fee & Disbursement Engine

## 1. Dynamic Platform Fee
- **Fitur Baru**: Admin Logikraf kini dapat mengatur `platform_fee_type` (Fixed / Percentage) dan `platform_fee_amount` untuk setiap aplikasi (SaaS) yang terintegrasi (seperti SB Digital).
- **Automasi**: API pembuatan Invoice (`POST /api/payment-hub/v1/invoices`) kini akan secara otomatis menghitung *fee* ini dan menjumlahkannya dengan nilai transaksi dasar (amount). Klien (misal warga) akan ditagihkan nominal yang sudah digabung dengan *platform fee*.
- **Database**: Penambahan kolom `platform_fee_type` dan `platform_fee_amount` di tabel `saas_applications`.

## 2. Disbursement Engine (Penarikan Dana)
- **Fitur Baru**: API Pencairan Dana / Payout telah aktif (`POST /api/payment-hub/v1/disbursements`).
- **Fungsi**: Digunakan oleh Klien (SaaS) untuk mencairkan dana yang mengendap di Sub-Account mereka ke rekening Bank lokal yang diinginkan (BCA, BRI, Mandiri, dll) secara instan (*real-time*) lewat infrastruktur xenPlatform.
- **Admin UI**: Penambahan tabel riwayat Disbursement di menu "Penarikan Dana" pada portal Admin Logikraf.
- **Database**: Pembuatan tabel `ph_disbursements` beserta model `PhDisbursement`.

## 3. Penyempurnaan UI/UX Admin Portal
- **Konsistensi Desain**: Form input, search bar, dan dropdown (*select*) telah diseragamkan gayanya.
- **Teknis**: Penambahan utility class `.input` di `resources/css/app.css` dan perbaikan direktif `@source` Tailwind CSS v4 agar dapat memindai komponen blade dengan benar dan memproduksi utility secara utuh (termasuk `bg-canvas-dark` dll).
