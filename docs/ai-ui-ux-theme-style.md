# AI UI/UX Theme & Style Guide: logikraf.id
**Project:** Visual Identity & Front-End Styling Specification
**Framework Target:** Tailwind CSS v4 (Native CSS-based Configuration) & Livewire v3 Components
**Version:** 1.0 (DirectAdmin Optimized Web Spec)

---

## 1. Visual Vibe & Design Philosophy

Desain antarmuka logikraf.id harus menyeimbangkan dua elemen utama: **Logika (Teknologi/Presisi)** dan **Kreatif (Desain/Estetika)**.
- **Asymmetric Grid & Cleanliness:** Memanfaatkan *generous whitespace* (jarak antar elemen yang luas) untuk memberikan kesan agensi premium, namun tetap patuh pada struktur grid yang presisi.
- **Micro-Legibility:** Mengutamakan keterbacaan tinggi pada teks studi kasus portofolio mendalam dengan kontras rasio minimal 4.5:1 (memenuhi standar WCAG AA).

---

## 2. Color System & Theme Variables

Berdasarkan arsitektur **Tailwind CSS v4**, konfigurasi tema tidak lagi ditulis di file `tailwind.config.js`, melainkan langsung menggunakan `@theme` directive di dalam file CSS utama (`resources/css/app.css`).

AI Assistant wajib menerapkan pemetaan warna berikut:

```css
@theme {
  /* Canvas & Backgrounds */
  --color-canvas-dark: #0B0F19;       /* Untuk section dark, hero, dan footer */
  --color-canvas-light: #F8FAFC;      /* Background utama halaman modul & text */
  --color-canvas-card: #FFFFFF;       /* Background untuk komponen card */

  /* Brand Accents (High Contrast CTAs) */
  --color-brand-primary: #0052FF;     /* Electric Cyber Blue - Tombol Utama & Validasi */
  --color-brand-accent: #10B981;      /* Vibrant Neon Mint - Status Sukses / 'Paid' */
  
  /* Typography & Line Colors */
  --color-txt-main: #0F172A;          /* Slate 900 untuk teks utama */
  --color-txt-muted: #64748B;         /* Slate 500 untuk sub-caption / deskripsi brief */
  --color-border-minimal: #E2E8F0;    /* Slate 200 untuk border form & pembatas milestone */
}

# Tailwind CSS v4 Setup

AI harus memastikan konfigurasi `resources/css/app.css` di-setup dengan sintaks native v4.

```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* Definisi Tema Langsung di CSS (Sesuai Tailwind v4 Native) */
@theme {
  --color-canvas-dark: #0B0F19;
  --color-canvas-light: #F8FAFC;
  --color-canvas-card: #FFFFFF;
  --color-brand-primary: #0052FF;
  --color-brand-accent: #10B981;
  --color-txt-main: #0F172A;
  --color-txt-muted: #64748B;
  --color-border-minimal: #E2E8F0;
  
  /* Variabel Font - Wajib ada untuk readability */
  --font-display: 'Sora', sans-serif; /* Untuk Judul & Hero */
  --font-body: 'Inter', sans-serif;    /* Untuk Portofolio Text */
}

/* 3. Typography System (Font & Spacing) */

Untuk memenuhi standar keterbacaan (Legibility) pada dokumen portofolio yang panjang, AI wajib menerapkan sistem tipografi yang ketat.

*   **Font Family:**
    *   **Display (Headings):** `font-display` (Sora) digunakan untuk judul hero dan heading utama agar menonjol secara visual.
    *   **Body (Content):** `font-body` (Inter) digunakan untuk paragraf, deskripsi studi kasus, dan input form. Inter dikenal memiliki karakter yang sangat jelas dibaca dalam ukuran kecil.
*   **Text Sizing Scale:** Menggunakan utilitas default Tailwind yang sudah dioptimasi, namun dengan padding vertikal (`py-6`, `py-8`) yang besar pada setiap section untuk menciptakan "airy feel" (kesan lega/mahal).
*   **Text Rendering:** Menerapkan `antialiased` atau `subpixel-antialiased` pada body untuk memastikan rendering teks halus di monitor modern.

*   **Spacing (Generous Whitespace):**
    *   **Section Gaps:** Setiap perpindahan antar section (misal dari Hero ke Modul) menggunakan gap minimal `gap-y-24` atau `gap-y-32` (setara `py-12` - `py-16`).
    *   **Component Padding:** Komponen *Card* atau *Timeline Item* harus memiliki `p-6` atau `p-8` di dalamnya, menghindari tampilan padat dan sempit.


/* 4. Global Styles & Micro-Interactions */

AI wajib menerapkan gaya global berikut pada komponen Livewire untuk meningkatkan pengalaman pengguna (UX) dan profesionalisme.

*   **Global Styles (app.css):**
    ```css
    @layer base {
      body { 
        @apply bg-canvas-light text-txt-main antialiased; 
      }

      /* Border Consistency: Semua elemen border menggunakan Slate 200 */
      .border-minimal { 
        @apply border-color-border-minimal; 
      }

      /* Utility for Card Styling (Light Theme) */
      .bg-card { 
        @apply bg-color-canvas-card shadow-sm border border-color-border-minimal;
      }
    }
    ```

*   **Button & Link States:**
    *   **Primary Button:** Menggunakan `bg-brand-primary hover:bg-blue-700` dengan animasi transisi singkat (`transition-colors duration-200 ease-in-out`).
    *   **Success State:** Komponen atau badge yang menandakan "Lunas" atau "Selesai" wajib menggunakan `bg-brand-accent text-white`.

*   **Form Inputs:**
    *   **Appearance:** Input form harus memiliki `border-color-border-minimal`, background `bg-white`, dan padding internal (`py-2 px-3`) yang cukup agar nyaman diisi.
    *   **Focus State (Validation):** Saat field error, outline input harus berubah menjadi merah (`border-red-500` dengan `ring-red-200`). Saat berhasil (`focus:border-brand-primary`), warna harus kembali ke biru cerah.

*   **Micro-Interactions (Hover Effects):**
    *   Semua elemen interaktif (tombol, link, thumbnail portofolio) wajib memiliki `transition-all duration-150 ease-in-out`. Hindari efek `transform` yang berat (misal `scale-105`) pada elemen yang sering di-scroll untuk menjaga performa.

*   **Visual Hierarchy:**
    *   **Headings:** Menggunakan `font-display` dengan ukuran besar (`text-4xl`, `text-5xl`) dan bobot tebal (`font-bold` atau `font-extrabold`).
    *   **Body Text:** Menggunakan `font-body` dengan ukuran `text-base` (`16px`) atau `text-lg` (`18px`) untuk readability maksimal.


5. AI Component Development Guide

Untuk memastikan konsistensi pada halaman logikraf.id, AI wajib mengikuti panduan teknis berikut:

A. Header (Navbar)

Posisi: Fixed di atas halaman (sticky top-0).

Komponen: Livewire Component.

Behavior:

Saat user scroll ke bawah (menggulir halaman), Header harus transparan (bg-transparent) dengan border tipis.

Saat user scroll ke atas (bergerak ke hero kembali), Header harus berubah solid (bg-color-canvas-light) dengan animasi transisi.

Styling:

Pastikan padding horizontal sangat lebar (misal p-x-8) untuk memberikan kesan ruang.

Logo: Teks "LOGIKRAF" menggunakan font display (Sora).

Link Navigasi: Menggunakan font body (Inter), ukuran text-sm, dengan hover effect underline berwarna brand primary.

B. Hero Section (Jumbotron)

Tujuan: Memberikan dampak visual "Premium Tech Agency" dalam satu pandangan.

Content Layout:

Sebagian besar halaman vertikal (tinggi 80vh+).

Fokus pada judul besar (Headline) dan sub-judul (Tagline) yang jelas.

Visual Effect:

Background Gelap (Canvas-Dark).

Menggunakan gradasi radial halus (radial-gradient) di belakang elemen utama untuk menarik fokus.

Typography:

Headline Utama: font-display, ukuran sangat besar (text-6xl), tebal (font-extrabold).

Sub-Headline: font-body, ukuran sedang (text-lg), kontras tinggi (text-white atau text-gray-300).

C. Modul Cards (Portofolio List)

Ini adalah inti dari halaman portofolio. AI harus menggunakan component Livewire yang reusable.

Structure:

Container menggunakan bg-card (putih bersih dengan border tipis).

Padding Internal: Minimal p-6 untuk memberikan nafas di dalam card.

Image/Thumbnail: Menggunakan aspect-video atau object-cover untuk memastikan gambar terlihat rapi tanpa terpotong aneh.

Typography & Spacing:

Judul Modul: Menggunakan font display, ukuran text-xl.

Deskripsi Singkat: Menggunakan font body, ukuran text-sm, warna text-muted.

Garis Pembatas: Di bagian bawah setiap card, gunakan border-b-color-border-minimal tipis untuk memisahkan dari tombol "Lihat Modul".

Button "Lihat Modul": Menggunakan brand primary, hover effect tegas, dan transition halus.

D. Pricing Table (Tabel Harga)

Styling untukPricing Table harus fokus pada hierarki visual agar user mudah membandingkan.

Header Column (Premium/Standard): Menggunakan warna bg-brand-primary (biru cerah) atau gradasi ringan untuk menonjol.

Checkmarks: Menggunakan brand-accent (hijau mint) untuk item yang termasuk dalam paket.

Border & Layout:

Gunakan border-minimal yang konsisten.

Padding vertikal yang cukup (misal py-3) pada setiap baris data agar tidak terlihat padat.

E. Footer

Tema: Canvas-Dark.

Layout: Menggunakan grid asimetris (misal 3 kolom: Logo & Deskripsi, Navigasi, Social Media & Contact).

Visual Treatment:

Menggunakan border-b tipis berwarna brand primary di bagian atas footer untuk memecah ruang.

Pastikan warna teks (text-muted) memiliki kontras tinggi terhadap background gelap.


#6. AI Component Development Guide

Untuk memastikan konsistensi pada halaman logikraf.id, AI wajib mengikuti panduan teknis berikut:

A. Header (Navbar)

Posisi: Fixed di atas halaman (sticky top-0).

Komponen: Livewire Component.

Behavior:

Saat user scroll ke bawah (menggulir halaman), Header harus transparan (bg-transparent) dengan border tipis.

Saat user scroll ke atas (bergerak ke hero kembali), Header harus berubah solid (bg-color-canvas-light) dengan animasi transisi.

Styling:

Pastikan padding horizontal sangat lebar (misal p-x-8) untuk memberikan kesan ruang.

Logo: Teks "LOGIKRAF" menggunakan font display (Sora).

Link Navigasi: Menggunakan font body (Inter), ukuran text-sm, dengan hover effect underline berwarna brand primary.

B. Hero Section (Jumbotron)

Tujuan: Memberikan dampak visual "Premium Tech Agency" dalam satu pandangan.

Content Layout:

Sebagian besar halaman vertikal (tinggi 80vh+).

Fokus pada judul besar (Headline) dan sub-judul (Tagline) yang jelas.

Visual Effect:

Background Gelap (Canvas-Dark).

Menggunakan gradasi radial halus (radial-gradient) di belakang elemen utama untuk menarik fokus.

Typography:

Headline Utama: font-display, ukuran sangat besar (text-6xl), tebal (font-extrabold).

Sub-Headline: font-body, ukuran sedang (text-lg), kontras tinggi (text-white atau text-gray-300).

C. Modul Cards (Portofolio List)

Ini adalah inti dari halaman portofolio. AI harus menggunakan component Livewire yang reusable.

Structure:

Container menggunakan bg-card (putih bersih dengan border tipis).

Padding Internal: Minimal p-6 untuk memberikan nafas di dalam card.

Image/Thumbnail: Menggunakan aspect-video atau object-cover untuk memastikan gambar terlihat rapi tanpa terpotong aneh.

Typography & Spacing:

Judul Modul: Menggunakan font display, ukuran text-xl.

Deskripsi Singkat: Menggunakan font body, ukuran text-sm, warna text-muted.

Garis Pembatas: Di bagian bawah setiap card, gunakan border-b-color-border-minimal tipis untuk memisahkan dari tombol "Lihat Modul".

Button "Lihat Modul": Menggunakan brand primary, hover effect tegas, dan transition halus.

D. Pricing Table (Tabel Harga)

Styling untukPricing Table harus fokus pada hierarki visual agar user mudah membandingkan.

Header Column (Premium/Standard): Menggunakan warna bg-brand-primary (biru cerah) atau gradasi ringan untuk menonjol.

Checkmarks: Menggunakan brand-accent (hijau mint) untuk item yang termasuk dalam paket.

Border & Layout:

Gunakan border-minimal yang konsisten.

Padding vertikal yang cukup (misal py-3) pada setiap baris data agar tidak terlihat padat.

E. Footer

Tema: Canvas-Dark.

Layout: Menggunakan grid asimetris (misal 3 kolom: Logo & Deskripsi, Navigasi, Social Media & Contact).

Visual Treatment:

Menggunakan border-b tipis berwarna brand primary di bagian atas footer untuk memecah ruang.

Pastikan warna teks (text-muted) memiliki kontras tinggi terhadap background gelap.


# 7. Responsive Design Guidelines (Mobile Optimization)

Situs harus berfungsi sempurna pada perangkat mobile (tablet dan smartphone).

Breakpoint Utama:

Mobile (< 768px): Layout vertikal, navigasi berubah menjadi menu hamburger, ukuran font sedikit lebih kecil (text-base).

Desktop (≥ 768px): Layout grid horizontal, semua elemen terlihat jelas.

Pengaturan Grid:

Pastikan komponen Hero dan Modul Cards tetap terbaca tanpa perlu scroll horizontal.

Gunakan flexbox atau grid dengan flex-wrap untuk memastikan card otomatis turun ke baris berikutnya di mobile.

Touch Targets:

Tombol dan link pada perangkat mobile harus memiliki ukuran minimum 44x44 pixel agar mudah ditekan.

# 8. Accessibility (A11y) Requirements

AI Assistant wajib memastikan situs memenuhi standar aksesibilitas dasar (WCAG 2.1 Level AA):

Rasio Kontras:

Teks utama terhadap background minimal 4.5:1.

Link dan tombol harus memiliki highlight visual saat di-focus (menggunakan border atau ring).

Navigasi Keyboard:

Semua link dan tombol harus bisa diakses menggunakan tombol Tab.

State Focus harus terlihat jelas pada elemen yang sedang aktif.

Semantic HTML:

Gunakan tag <nav> untuk navigasi, <h1> untuk judul utama, dan <section> untuk membagi konten agar mudah diproses oleh screen reader.


# 9. AI Implementation Logic Flow

AI harus menerapkan alur kerja berikut dalam membangun komponen:

Step 1: Analysis & Decomposition

Analisis struktur halaman (layout grid dan hierarchical order).

Identifikasi komponen reusable (Card, Button, Navbar).

Step 2: Tailwind v4 Configuration Check

Pastikan variabel @theme sudah didefinisikan di app.css.

Pastikan font (Sora, Inter) dan utilitas spacing sudah tersedia.

Step 3: Component Development (Livewire)

Buat komponen Livewire dengan blade view.

Terapkan styling menggunakan Tailwind classes sesuai panduan di atas.

Step 4: Micro-Interaction Implementation

Tambahkan class transition ke semua elemen interaktif.

Pastikan state hover dan focus memiliki warna yang konsisten dengan brand.

Step 5: Responsive Testing

Verifikasi tampilan pada breakpoint mobile (768px) dan desktop (1280px) menggunakan pseudo-elements utilities (sm:, md:, lg:).


# 10. Documentation & Knowledge Base

Untuk menjaga project tetap terstruktur dan mudah dipahami, AI Assistant wajib memastikan dokumentasi berikut selalu up-to-date di dalam project root:

# 01_PROJECT_OVERVIEW.md

File ini harus berisi ringkasan eksekutif tentang struktur project.

Key Content:

Project Title: Logika Kreatif Indonesia - Landing Page.

Tech Stack: Laravel 11, Livewire v4, Tailwind CSS v4, Alpine.js.

Theme Reference: Canvas-Dark UI/UX System.

Project Status: (Updated: YYYY-MM-DD).

# 02_TAILWIND_V4_THEME_CONFIG.md

File ini berfungsi sebagai dokumentasi living style guide untuk warna, typography, dan spacing yang digunakan.

Key Content:

Typography Rules:

Headers: font-display (Sora), weight 700-800.

Body: font-body (Inter), weight 400-500.

Color Palette (Variables):

Brand Primary: #4F46E5 (Indigo 600)

Brand Secondary: #6366F1 (Indigo 500)

Brand Accent: #10B981 (Emerald 500)

Backgrounds: #0B1120 (Canvas-Dark), #FFFFFF (Canvas-Light), #F3F4F6 (Canvas-Overlay).

Spacing System: Definisi utilitas spacing (sm:, md:, lg:) yang digunakan di seluruh project.

# 03_COMPONENT_LIBRARY.md

Daftar semua komponen Livewire yang dibuat beserta deskripsi dan parameter penggunaannya.

Key Content (Contoh):*

Navbar Component:

File: app/Livewire/Navbar.php

Props: $scrolled (bool)

Usage: sticky top-0, transparent on scroll.

Hero Component:

File: app/Livewire/HeroSection.php

Props: $title, $subtitle

Usage: Full viewport height, centered content.

Pricing Card Component:

File: app/Livewire/PricingCard.php

Props: $package, $price, $features

Usage: Border-radius md, Shadow-lg, Hover lift effect.

# 04_RESPONSIVE_BREAKPOINTS.md

Dokumentasi mengenai breakpoint yang digunakan dalam sistem desain.

Key Content:*

Mobile (< 768px): Stack layout, full width elements.

Tablet (768px - 1024px): 2-column grid support.

Desktop (≥ 1024px): Multi-column layouts, increased padding.

# 05_DEPLOYMENT_PLAYBOOK.md

Instruksi teknis untuk deployment.

Key Content:*

Build Command: npm run build:css

Production Build: php artisan optimize

Cache Clear: php artisan optimize:clear

Environment Variables: Variabel wajib yang harus ada di .env (DB_CONNECTION, APP_URL, dll).
