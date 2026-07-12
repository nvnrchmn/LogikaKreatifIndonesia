# Changelog - Fase 2 & UI/UX Refinements
**Tanggal:** 12 Juli 2026

## Fitur Baru (Fase 2 - Helpdesk & Kanban)
- **Helpdesk (Sistem Tiket):**
  - Klien dapat membuat tiket bantuan (Helpdesk) untuk pesanan yang sudah lunas (Paid).
  - Admin dapat membalas tiket dan mengubah status (Open, Replied, Closed).
  - Integrasi UI Helpdesk dengan Design System portal yang sudah ada.
  - Penambahan menu `Helpdesk` pada *sidebar* Admin dan Klien.
- **Kanban Board:**
  - Papan kanban (*To Do*, *In Progress*, *Review*, *Done*) terintegrasi di halaman Detail Pesanan (Admin & Klien).
  - Admin memiliki akses penuh untuk menambah dan menggeser (*drag and drop*) tugas.
  - Klien memiliki akses *Read-Only* untuk memantau perkembangan (*progress*) tugas secara *real-time* dan transparan.

## Perbaikan UI/UX (Refinements)
- **Standardisasi Desain Tombol (Buttons):**
  - Membuat *utility class* `.btn`, `.btn-primary`, `.btn-secondary` secara global pada `app.css` (Tailwind) dengan radius seragam (`rounded-xl`).
  - Memastikan tombol responsif dan teks tidak terpotong atau terlipat aneh pada tampilan *mobile* (`whitespace-nowrap`).
- **Penyelarasan UI Admin Portal:**
  - Melakukan *refactor* besar-besaran pada halaman Detail Pesanan Admin (`admin.orders.show`).
  - Mengganti modal lama dengan halaman utuh yang memuat *Asset Vault*, *Project Thread* (Chat), dan *Kanban Board* dalam satu antarmuka yang rapi.
  - Memperbaiki *bug layout* (file tidak merender `<head>` dan *sidebar* Admin) dengan membungkus konten menggunakan komponen `<x-layouts.admin>`.
  - Mengonfigurasi ulang rute untuk memanggil struktur Blade standar (bukan *raw view*), sehingga CSS berhasil di-*load*.
- **Pembaruan Navigasi Halaman Utama (Homepage Navbar):**
  - Mengimplementasikan fitur *Dynamic Auth Button* pada Navbar.
  - Tombol "Mulai Proyek" akan otomatis berubah menjadi "Portal Admin" atau "Portal Klien" jika pengguna (Admin/Klien) sedang dalam keadaan *login*.
- **Integrasi Build System:**
  - Melakukan kompilasi ulang (rebuild) aset CSS via Vite untuk memastikan semua variabel *Design System* baru termuat di *production server*.

## File yang Berubah
- `resources/css/app.css`
- `resources/views/components/layouts/admin.blade.php`
- `resources/views/livewire/admin/orders/index.blade.php`
- `resources/views/components/admin/orders/show.blade.php`
- `resources/views/livewire/navbar.blade.php`
- (Seluruh komponen dan migrasi dari pembuatan Helpdesk dan Kanban)
