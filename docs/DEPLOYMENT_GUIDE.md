# Panduan Deployment logikraf.id (DirectAdmin / Shared Hosting)

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deployment aplikasi **logikraf.id** (Laravel 12 + Livewire + Tailwind CSS v4) ke production server, khususnya pada panel **DirectAdmin** (seperti Hostdata.id).

## 1. Persiapan Build di Local (Sebelum Upload)

Di environment lokal Anda (Laragon), jalankan perintah berikut untuk meng-compile asset CSS/JS:

```bash
# Install dependency Node.js
npm install

# Compile asset untuk production
npm run build
```

Ini akan menghasilkan folder `public/build` yang berisi file CSS (Tailwind v4) dan JS yang sudah di-minify.

## 2. Upload File ke Server

Karena ini shared hosting / DirectAdmin:

1. Compress seluruh folder proyek Anda di lokal menjadi `.zip` (kecuali folder `node_modules` dan `.git`).
2. Login ke **DirectAdmin**.
3. Masuk ke **File Manager**.
4. Disarankan untuk memisahkan core Laravel dan folder `public`:
   - Buat folder di luar `public_html` (misal: `/home/username/logikraf-core`) dan ekstrak isi zip ke sana.
   - Pindahkan seluruh isi folder `public` dari core ke dalam folder `public_html` (atau folder domain Anda).
5. Buka file `index.php` di dalam `public_html`, dan ubah path-nya mengarah ke folder core Anda:
   ```php
   // Ubah:
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';
   
   // Menjadi:
   require __DIR__.'/../logikraf-core/vendor/autoload.php';
   $app = require_once __DIR__.'/../logikraf-core/bootstrap/app.php';
   ```

## 3. Konfigurasi Database & Environment

1. Di DirectAdmin, masuk ke menu **MySQL Management**.
2. Buat database baru dan user baru, catat credentials-nya.
3. Edit file `.env` di server (di folder `logikraf-core`), sesuaikan konfigurasi berikut:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://logikraf.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_db_anda
DB_USERNAME=user_db_anda
DB_PASSWORD=password_db_anda
```

## 4. Setup Storage Symlink (Penting!)

Karena folder `public` sudah dipisah, symlink bawaan Laravel `php artisan storage:link` mungkin tidak bekerja semestinya di shared hosting. 

Solusinya, buat file `symlink.php` di dalam `public_html`:

```php
<?php
$targetFolder = $_SERVER['DOCUMENT_ROOT'].'/../logikraf-core/storage/app/public';
$linkFolder = $_SERVER['DOCUMENT_ROOT'].'/storage';

if (symlink($targetFolder, $linkFolder)) {
    echo "Symlink created successfully!";
} else {
    echo "Failed to create symlink.";
}
```
Akses `https://logikraf.id/symlink.php` di browser sekali saja, lalu **hapus** file tersebut.

## 5. Menjalankan Migrasi

Jika Anda memiliki akses terminal (SSH) di DirectAdmin:
```bash
cd logikraf-core
php artisan migrate --force
```

Jika tidak ada akses SSH, ekspor database dari lokal (file `.sql`) dan impor via **phpMyAdmin** di DirectAdmin.

## 6. Setup Cron Jobs (Task Scheduling)

Aplikasi membutuhkan cron job untuk menjalankan email queue, pengecekan pembayaran pending (expire), dll.
Di DirectAdmin, masuk ke menu **Cron Jobs**. Tambahkan cron job berikut untuk berjalan setiap menit (`* * * * *`):

```bash
cd /home/username/logikraf-core && php artisan schedule:run >> /dev/null 2>&1
```

## 7. Optimasi Terakhir (Performance)

Jika ada akses SSH, jalankan:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
*Catatan: Pastikan tidak ada konfigurasi di `.env` yang dipanggil langsung menggunakan fungsi `env()` di dalam kode selain di file konfigurasi (`config/*.php`), karena akan menghasilkan nilai `null` saat dicache.*

Website logikraf.id Anda sudah siap untuk go live!
