# Changelog: 11 Juli 2026
**Waktu Eksekusi:** 19:19 WIB
**Topik Utama:** Implementasi Sistem Pembayaran (Xendit) & Halaman Publik (Fase 4)

## Fitur & Perubahan yang Ditambahkan:

### 1. Sistem Pembayaran & Invoicing (Xendit)
- **Agnostic Payment Gateway:** Refaktor integrasi agar dapat berganti antara Xendit atau Midtrans.
- **Pengaturan Global Payment:** Menambahkan antarmuka di Admin Panel > Pengaturan Global untuk menyimpan *Secret Key* dan *Public Key* Xendit ke database (tabel `settings`), menghapus kebutuhan hardcode di `.env`.
- **Client Portal (Dashboard):** Membuat sistem penagihan *(invoicing)* dengan tautan ke halaman simulasi pembayaran Xendit. Status *Order* dan *Transaction* terhubung dengan mulus.
- **Penyempurnaan Tampilan Tagihan:** Tombol "Hubungi Dukungan" kini aktif (mengarah otomatis ke WhatsApp Tim dengan pesan prasetel), dan *Milestone* penagihan kini dibuat "Progresif" (Klien hanya akan melihat *milestone* tahap selanjutnya jika tagihan saat ini sudah dibayar, mengurangi beban visual).
- **Cetak Invoice PDF:** Memasang pustaka DOMPDF untuk mengekspor dokumen "Detail Proyek & Tagihan" menjadi file PDF formal yang dapat diunduh (menggantikan tombol "Cetak Halaman" bawaan *browser*).

### 2. Website Publik (Fase 4)
- **Halaman Legal (Xendit Compliance):** Membuat Halaman `Syarat & Ketentuan` dan `Kebijakan Privasi` yang secara spesifik mencakup aturan perlindungan hukum untuk model bisnis **IT Solutions** (Custom Projects) dan **SaaS** (Subscription).
- **Halaman Informasi Perusahaan:** Membuat `Tentang Kami` dan `Hubungi Kami` (dengan form dummy).
- **Layanan Dinamis:** Membuat halaman detail khusus untuk tiap layanan: *Software Development*, *UI/UX Design*, *Digital Marketing*, dan *Branding*.
- **Perbaikan UI/UX:** Memperbaiki teks "Agensi" menjadi "Software House & IT Solutions", membuang penyebutan "Midtrans" di halaman legal klien, dan mengatur transparansi *Navbar* agar pintar menyesuaikan dengan rute halaman yang sedang diakses.
- **Pengaturan Kontak Dinamis:** Alamat Email, Nomor Telepon/WhatsApp, dan Alamat Kantor kini bisa diubah melalui Admin Panel > Pengaturan Global, dan akan langsung diterapkan pada halaman publik. (Telah dipisah menjadi formulir *card* mandiri yang terlepas dari formulir *Payment Gateway* untuk keamanan dan kerapian).
- **Ikon Sosial Footer Dinamis:** Menghapus ikon Instagram dan LinkedIn di Footer, dan menggantinya dengan ikon Email dan WhatsApp yang terhubung langsung dengan data Kontak Dinamis di Pengaturan Global. Tombol WhatsApp akan langsung mengarah ke WhatsApp API.
- **Persetujuan Syarat & Ketentuan (T&C):** Menambahkan mekanisme pelindung hukum (*checkbox* persetujuan) yang wajib dicentang klien sebelum tombol pembayaran (*Pay Now*) Xendit dapat diklik.
- **Notifikasi Global:** Mengimplementasikan **SweetAlert2** untuk notifikasi keberhasilan (*toast success*) secara dinamis (misal: saat menyimpan Pengaturan Global), membuang notifikasi *flash* bawaan yang kurang interaktif.

### 3. Pemolesan UI/UX & Responsivitas (Mobile)
- **Desain Logo yang Presisi:** Menyempurnakan ukuran logo di Navbar, Footer, Admin Portal, dan Client Portal menggunakan aspek rasio yang tepat (`h-10 w-auto`), serta menyesuaikan posisi teks "LOGIKRAF" agar sejajar secara vertikal.
- **Penyempurnaan Invoice PDF:** Menyesuaikan desain *Invoice* PDF menggunakan gambar logo transparan murni, memperbesar ukuran logo (`110px`) dengan *margin negatif* untuk mengakali *whitespace*, mengganti keluarga font (*font-family*) ke *Plus Jakarta Sans*, dan meratakan informasi Order ke sebelah kanan (*text-align: right*).
- **Portal Responsif di Layar Ponsel:** Melakukan perombakan *layout* pada Admin Portal dan Client Portal agar bekerja sempurna pada layar ponsel. Menambahkan mekanisme menu sisi melayang (*off-canvas sidebar overlay*) yang dapat dimunculkan/disembunyikan melalui tombol *Hamburger Menu* berbekal logika dari Alpine.js.
- **Sinkronisasi Kode (GitHub):** Menginisialisasi repositori Git lokal dan melakukan unggah kode (push) perdana secara utuh ke repositori jarak jauh (`origin/main`).

## Status Aplikasi Saat Ini
- Website publik telah memenuhi kriteria dasar kelayakan untuk pengajuan integrasi ke lingkungan *Live* (Production) Xendit.
- Klien dapat masuk (*login*), melihat *milestone* penagihan, dan memproses pembayaran menggunakan *invoice* Xendit.

### Sistem Deploy Otomatis (CI/CD Webhook)
- Menambahkan konfigurasi GitHub Actions (.github/workflows/deploy.yml).
- Membuat rute Webhook berbasis *flag* di outes/web.php untuk mem-bypass restriksi shell_exec di DirectAdmin.
- Mengaktifkan metode *cronjob polling* menggunakan file deploy.sh dan deploy.flag.

### Klien dan Integrasi Xendit
- Mengaktifkan fitur keamanan *Callback Token* untuk Xendit Webhook di XenditWebhookController.php.
- Mengubah pembuatan *password* akun Client yang berasal dari Lead menjadi *default password* (logikraf123) agar Admin bisa langsung membagikannya kepada klien.


### Pengaturan Global & Notifikasi Email
- Menambahkan menu konfigurasi SMTP Email dinamis di halaman Pengaturan Global Admin.
- Mengintegrasikan SweetAlert2 (*popup alert*) secara global di halaman utama klien (*frontend*).
- Membuat sistem pengiriman email otomatis (ClientLeadNotification) kepada calon klien yang baru saja men-*submit* formulir Mulai Proyek.
- Memunculkan notifikasi pop-up SweetAlert ucapan terima kasih kepada klien setelah formulir sukses terkirim.

