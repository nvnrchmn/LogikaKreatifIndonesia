# Project Overview: logikraf.id
**Client/Company:** PT. Logika Kreatif Indonesia  
**Industry:** Digital Creative Agency & Software House  
**Project Objective:** Membangun platform digital modern yang berfungsi sebagai portofolio interaktif, etalase layanan, manajemen termin proyek, dan mesin konversi prospek (lead generation) untuk menarik klien korporasi serta UMKM.

---

## 1. Executive Summary

logikraf.id adalah identitas digital dari PT. Logika Kreatif Indonesia, sebuah agensi yang menjembatani solusi berbasis logika teknologi (Software Development) dengan eksekusi kreativitas (UI/UX Design, Digital Marketing, dan Branding). 

Website ini harus mencerminkan reputasi yang solid, bersih, cepat, berteknologi modern, dan mudah dinavigasi. Fokus utama platform ini bukan sekadar memberikan informasi statis, melainkan mengonversi pengunjung menjadi prospek klien potensial, mengelola tahapan pembayaran proyek (*milestone billing*), serta menampilkan kapabilitas teknis *software house* secara transparan.

---

## 2. Target Audiens

AI harus merancang antarmuka (UI) dan pengalaman pengguna (UX) untuk mengakomodasi dua kelompok audiens utama:
1. **Pemilik Bisnis & Direktur Perusahaan (B2B):** Membutuhkan bukti nyata (Portofolio/Studi Kasus), kejelasan teknis layanan, profesionalisme, serta transparansi alur kerja dan skema pembayaran termin.
2. **Founder Startup & Pelaku UMKM:** Membutuhkan solusi teknologi yang cepat, kalkulasi estimasi proyek yang mudah diakses, serta kejelasan modul sistem yang fleksibel.

---

## 3. Core Features & Scope of Work (Ruang Lingkup Proyek)

Agen AI wajib membangun dan mengimplementasikan modul-modul utama berikut:

### 3.1 Dynamic Showcase & Deep-Dive Portfolio System
- Halaman katalog layanan interaktif yang membagi keahlian menjadi 4 kategori utama: Software Development, UI/UX Design, Digital Marketing, dan Branding.
- Galeri portofolio dinamis yang dilengkapi dengan sistem filter berbasis Livewire (tanpa reload halaman) agar klien dapat melihat riwayat proyek berdasarkan kategori tertentu.
- **Tech Stack & Case Study Spec:** Halaman detail portofolio yang dapat menampilkan daftar *tech stack* spesifik (misal: Built with Laravel & React), tantangan proyek, dan solusi yang diberikan oleh logikraf.id.

### 3.2 Lead Capture & CRM Hub
- **Interactive Project Brief & Estimation Form:** Komponen formulir dinamis (Livewire) yang menanyakan detail kebutuhan proyek secara interaktif (Kategori layanan, perkiraan jumlah halaman/fitur, target peluncuran, dan estimasi *budget*).
- **Lead Scoring & Allocation System:** Menyimpan data leads ke database dan memberikan tanda prioritas (*scoring*) otomatis berdasarkan skala *budget* proyek.
- **Automated Notification Trigger:** Mengintegrasikan sistem notifikasi instan (Laravel Queue Mail / Slack / WhatsApp API Webhook) agar setiap kali ada formulir masuk, tim Account Executive mendapatkan *alert* instan.

### 3.3 Agnostic Digital Transaction & Milestone Billing Modul
- **Agnostic Payment Gateway Modul:** Menggunakan arsitektur `PaymentGatewayInterface` modular agar bisa berganti vendor (*driver*) pembayaran (seperti Xendit, Midtrans, atau Tripay) hanya lewat konfigurasi `.env`.
- **Down Payment (DP) & Milestone Billing Logic:** Modul pembayaran yang mendukung sistem termin/tahapan pengerjaan (misal: DP 30% untuk Kickoff, Milestone Development 40%, UAT/Peluncuran 30%) karena proyek perangkat lunak menggunakan sistem pembayaran bertahap.
- **Dynamic Invoicing System:** Menerbitkan nomor invoice otomatis (Format: `LK-YYYYMMDD-XXXX`) per termin/milestone pembayaran dan melacak log status secara *real-time* via Webhook (Pending, Settlement, Expired, Failed).

### 3.4 Secure Administrative Panel
- Dasbor khusus admin untuk mengelola manajemen CRUD konten layanan, mengunggah studi kasus portofolio beserta tag *tech stack*-nya.
- Dasbor monitoring untuk memantau masuknya prospek proyek (*leads management*), melihat performa konversi, serta mengelola status pembayaran termin klien aktif (`in_progress`, `completed`, `cancelled`).

---

## 4. Key Performance & Success Metrics

Saat membuat atau mengoptimalkan kode untuk website ini, Agen AI harus memastikan aplikasi memenuhi kriteria berikut:
- **Performance:** Skor performa minimal 90+ pada Google Lighthouse (Core Web Vitals) melalui optimalisasi aset gambar portofolio dan pemanfaatan caching query Laravel.
- **Security:** Proteksi penuh pada setiap celah input form (CSRF, XSS protection), pembatasan laju pengiriman (*rate limiting*) form leads, dan pembatasan akses ketat pada jalur backend admin menggunakan Middleware otentikasi.
- **Scalability:** Struktur kode yang bersih (*clean code*) berbasis kontrak/interface, memudahkan tim developer internal untuk memperluas fitur di kemudian hari tanpa menulis ulang logika dasar dari awal.