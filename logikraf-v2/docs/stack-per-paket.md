# Stack Teknologi per Paket — dokumen rujukan

**Berlaku sejak:** 15 September 2026 (keputusan Nova).

**Tujuan:** satu rujukan saat menawarkan & membangun paket Logikraf — supaya tiap paket punya stack yang konsisten, bisa dioperasikan satu orang, dan tidak kelebihan mesin untuk harga jualnya.

## Ringkasan keputusan

| Paket | Harga | Stack |
|---|---|---|
| Logikraf Starter | Rp 1.499.000 + Rp 150.000/bln | **Astro** (statis) + CMS bersama |
| Logikraf Business | Rp 2.499.000 + Rp 200.000/bln | **Astro** statis + CMS |
| Logikraf Commerce | Rp 5.999.000 + Rp 50.000/bln + 2%/transaksi | **Go + React + TypeScript + Tailwind** |

## Tiga prinsip dasar

1. **Biaya pemeliharaan menentukan kompleksitas, bukan daftar fitur.** Pemeliharaan dijual Rp 150–200 ribu/bulan. Kalau tiap klien dapat satu service Go + satu database sendiri, sepuluh klien berarti sepuluh hal untuk di-patch, di-backup, dan di-restart — marginnya habis di operasional.

2. **SEO menentukan apakah HTML harus dirender di server.** Halaman yang harus terindeks (layanan, artikel, produk) tidak boleh bergantung pada JavaScript yang jalan di browser pengunjung.

3. **Aset sulit jangan dibangun ulang.** Hub QRIS (Xendit + webhook + rekonsiliasi), integrasi Biteship, gateway WhatsApp (GoWA), dan BillionMail sudah dimiliki — pakai, jangan bikin lagi.

## Paket Starter — Astro

- **Frontend:** Astro dengan output statis → HTML jadi, disajikan nginx. Tidak ada service aplikasi dan tidak ada database per klien.
- **CMS:** satu backend CMS **multi-tenant bersama** (Go Fiber + Postgres dengan RLS — pola yang sudah terbukti di smarthub-v3) melayani semua klien Starter. Menambah klien = menambah baris data, bukan menambah service.
- **SEO:** HTML sudah benar sejak proses build; sitemap dan meta per halaman dihasilkan otomatis.
- **Yang sengaja dihindari:** pola SPA + injeksi meta. Pola inilah yang membuat logikraf.id sendiri sempat memasang `<link rel="canonical">` salah ke semua halaman (bug diperbaiki 14 Sep 2026). Kerapuhan seperti itu tidak boleh digandakan ke banyak klien.

## Paket Business — Astro statis + CMS

- **Frontend:** tetap Astro. Blog/artikel diambil dari CMS saat build, jadi hasilnya HTML statis yang cepat dan mudah diindeks.
- **Konten dinamis:** CMS memanggil webhook → GitHub Actions membangun ulang situs. Artikel baru muncul dalam hitungan menit tanpa menyentuh server.
- **Formulir lead:** backend CMS yang sama menangani penyimpanan + notifikasi, memakai **GoWA** (WhatsApp) dan **BillionMail** (email) yang sudah berjalan — tidak ada biaya layanan baru.
- **SEO per halaman:** jadi bawaan proses build, bukan pekerjaan tambahan tiap klien.
- **Kuota 5 admin:** cukup lewat peran di CMS bersama, tanpa instalasi apa pun per klien.

## Paket Commerce — Go + React + TypeScript + Tailwind

- **Backend:** Go. Pakai ulang hub QRIS (Xendit + webhook + auto-update status) dan pola rekonsiliasi pembayaran yang sudah dibangun dan teruji di smarthub-v3 — jangan tulis lagi dari nol.
- **Storefront:** React + TypeScript + Tailwind. Halaman produk dan artikel di-prerender supaya terindeks, karena SEO produk termasuk janji paket ini.
- **Panel admin:** React + Ant Design, mengikuti standar admin Logikraf yang sudah ada.
- **Ongkir & resi:** Biteship (integrasinya sudah tersedia).
- **Notifikasi WhatsApp:** GoWA pada setiap perubahan status pesanan.
- **Antrean pekerjaan:** Redis + Asynq untuk notifikasi, sinkronisasi resi, dan rekonsiliasi pembayaran — smarthub-v3 sudah menjalankan Redis, jadi tidak ada infrastruktur baru.
- **Multi-tenant:** jalankan sebagai satu backend multi-tenant (Postgres + RLS), bukan service + database per klien. Inilah yang membuat bagi hasil 2% per transaksi menjadi margin, bukan habis menutup biaya operasional.

### Kenapa bukan Shopify atau WooCommerce

Keduanya lebih cepat untuk mulai, tapi Shopify memotong transaksi, WooCommerce menambah ekosistem kedua yang harus di-patch keamanannya tiap bulan, dan keduanya tidak bisa mewujudkan pembeda paket ini: **QRIS satu pintu ber-brand Logikraf**. Di paket Commerce, kendali atas alur pembayaran justru nilai jualnya.

## Keputusan arsitektur lintas paket

Ubah pola dari **"service + database per klien"** menjadi **"satu backend multi-tenant + frontend statis per klien"**. Pola lama masih terlihat di armada sekarang: `logikraf-export`, `nova-profile`, `livine`, dan `mysticglide` masing-masing punya service dan database sendiri.

Konsekuensinya CMS dan Commerce memakai **Postgres** (butuh RLS), sementara armada lama memakai MySQL. Dua mesin basis data berarti satu keahlian tambahan untuk dirawat — tetapi keduanya sudah berjalan sekarang, jadi ini bukan beban baru.

## Yang belum diputuskan

- Bentuk nyata CMS bersama: subdomain internal (`cms.logikraf.id`) atau service pada port baru?
- Klien lama dibiarkan berjalan apa adanya, atau dimigrasikan bertahap?
- Template Starter dibuat sekali sebagai repositori `starter-astro`, supaya klien baru = clone + isi konten.

## Harga coret di halaman /paket (disepakati 15 Sep 2026)

Halaman `/paket` menampilkan **harga coret** dari kolom `strike_price` di tabel `packages`:

| Paket | Harga coret | Harga berlaku |
|---|---|---|
| Logikraf Starter | Rp 1.999.000 | Rp 1.499.000 |
| Logikraf Business | Rp 3.999.000 | Rp 2.499.000 |
| Logikraf Commerce | Rp 6.999.000 | Rp 5.999.000 |

Kolom `strike_price` sudah ada di tabel `packages` dan sudah bisa diisi dari admin (menu Paket → "Harga Coret / Asli"). Nilai fallback di frontend disamakan dengan angka di atas, supaya bila API gagal pengunjung tidak melihat harga yang salah.
