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

## Status Aplikasi Saat Ini
- Website publik telah memenuhi kriteria dasar kelayakan untuk pengajuan integrasi ke lingkungan *Live* (Production) Xendit.
- Klien dapat masuk (*login*), melihat *milestone* penagihan, dan memproses pembayaran menggunakan *invoice* Xendit.
