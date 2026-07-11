# Changelog - 12 Juli 2026

## Fitur Keamanan Klien (Force Password Reset)
- Menambahkan field must_change_password ke tabel users.
- Mengubah logika pembuatan User saat Admin/Sistem menerima Lead menjadi otomatis meminta ganti password di awal.
- Membuat Middleware ForcePasswordChange yang mencegah klien mengakses menu apapun sebelum mengganti password default.
- Menambahkan halaman Livewire ForcePasswordReset khusus untuk klien baru.

