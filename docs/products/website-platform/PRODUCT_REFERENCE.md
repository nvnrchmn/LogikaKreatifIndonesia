# Logikraf Business Website Platform

Document Type: Product Reference
Product: Logikraf Business Website Platform
Brand: Logikraf
Status: Product Concept / Reference
Version: 1.0
Last Updated: 2026-08-16

---

## 1. Product Overview

Logikraf Business Website Platform adalah platform SaaS dari Logikraf yang memungkinkan UMKM dan bisnis kecil hingga menengah memiliki website profesional sekaligus mengembangkan fungsi website menjadi alat bantu operasional dan perdagangan digital.

Platform ini bukan sekadar kumpulan paket website. Platform dirancang sebagai satu core platform yang memiliki kemampuan bertingkat sesuai kebutuhan bisnis:

```
                        LOGIKRAF
                           │
                  Business Website Platform
                           │
           ┌───────────────┼───────────────┐
           │               │               │
        STARTER         BUSINESS        COMMERCE
           │               │               │
           ▼               ▼               ▼
      Online Presence   Business Tools   Online Commerce
```

Perbedaan antara paket bukan berupa teknologi atau codebase yang berbeda, melainkan fitur dan kapabilitas yang tersedia berdasarkan subscription tier.

---

## 2. Product Vision

"Membantu UMKM membangun kehadiran digital, menjalankan bisnis, dan berkembang melalui satu platform yang sederhana, terjangkau, dan scalable."

Platform harus memungkinkan sebuah bisnis memulai dari kebutuhan paling sederhana: "Saya butuh website profesional." Kemudian berkembang menjadi: "Saya ingin website membantu menjalankan bisnis." Dan akhirnya: "Saya ingin website menjadi tempat transaksi bisnis saya."

Perjalanan tersebut harus dapat dilakukan tanpa harus membuat website baru atau melakukan migrasi platform.

```
Starter → Business → Commerce
```

Upgrade harus membuka kapabilitas baru pada tenant yang sama.

---

## 3. Core Product Principle

### 3.1 One Platform, Multiple Capabilities
Semua subscription tier menggunakan core platform yang sama. Tidak diperbolehkan membuat tiga aplikasi terpisah untuk Starter, Business, dan Commerce.

### 3.2 Feature Gating
Subscription menentukan fitur yang dapat digunakan tenant (lihat Feature Matrix section 8). Feature availability harus ditentukan oleh subscription/entitlement system, bukan hard-coded secara terpisah pada setiap halaman.

### 3.3 Upgrade Without Migration
Tenant dapat melakukan upgrade Starter → Business → Commerce tanpa: membuat website baru, memindahkan data, membuat tenant baru, mengganti URL, migrasi database, atau membuat akun baru. Setelah subscription berubah, feature entitlement diperbarui dan fitur yang sebelumnya terkunci menjadi tersedia.

---

## 4. Target Market

UMKM dan bisnis lokal yang membutuhkan kehadiran digital dan/atau digitalisasi proses bisnis. Contoh: UMKM lokal, Salon, Barbershop, Laundry, Bengkel, Fotografer, Wedding organizer, Travel, Studio, Training/kursus, Konsultan, Freelancer, Agency, Contractor, Fashion, F&B, Retail, Handmade business, Jasa profesional. Platform harus bersifat horizontal (tidak bergantung satu industri).

---

## 5–7. Subscription Tiers

**Starter** — "Saya cuma butuh website profesional." Online presence: Landing page, Profil bisnis, Produk/jasa, Galeri, Kontak, Google Maps, WhatsApp CTA, Social links, SEO basic, Mobile responsive, SSL, Hosting, CMS sederhana.

**Business** — "Saya ingin website saya membantu menjalankan bisnis." Semua Starter + Katalog produk, Kategori, Form order, Booking, Artikel/blog, Promo, Customer database, Dashboard admin, Analytics, Lead management, Notification.

**Commerce** — "Saya ingin website saya menjadi tempat transaksi." Semua Business + Online order, Cart, Checkout, Payment gateway, Invoice, Customer management, Inventory, Order management, Sales report, Payment report, Promo/voucher, Product variants, Shipping integration. Commerce = mini commerce platform.

---

## 8. Feature Matrix

| Feature | Starter | Business | Commerce |
|---------|---------|----------|----------|
| Website | ✓ | ✓ | ✓ |
| CMS | ✓ | ✓ | ✓ |
| Profil bisnis | ✓ | ✓ | ✓ |
| Produk/jasa | ✓ | ✓ | ✓ |
| Galeri | ✓ | ✓ | ✓ |
| Kontak | ✓ | ✓ | ✓ |
| Google Maps | ✓ | ✓ | ✓ |
| WhatsApp CTA | ✓ | ✓ | ✓ |
| Social links | ✓ | ✓ | ✓ |
| SEO Basic | ✓ | ✓ | ✓ |
| Mobile Responsive | ✓ | ✓ | ✓ |
| SSL | ✓ | ✓ | ✓ |
| Hosting | ✓ | ✓ | ✓ |
| Katalog produk | — | ✓ | ✓ |
| Kategori produk | — | ✓ | ✓ |
| Form order | — | ✓ | ✓ |
| Booking | — | ✓ | ✓ |
| Blog/Artikel | — | ✓ | ✓ |
| Promo | — | ✓ | ✓ |
| Customer database | — | ✓ | ✓ |
| Dashboard admin | Basic | ✓ | ✓ |
| Analytics | Basic | Advanced | Advanced |
| Lead management | — | ✓ | ✓ |
| Notification | — | ✓ | ✓ |
| Online order | — | — | ✓ |
| Cart | — | — | ✓ |
| Checkout | — | — | ✓ |
| Payment gateway | — | — | ✓ |
| Invoice | — | — | ✓ |
| Inventory | — | — | ✓ |
| Order management | — | — | ✓ |
| Sales report | — | — | ✓ |
| Payment report | — | — | ✓ |
| Voucher | — | — | ✓ |
| Product variants | — | — | ✓ |
| Shipping integration | — | — | ✓ |

---

## 9. Platform Architecture

Shared core + multi-tenant. LOGIKRAF CORE → Website CMS / Business Core / Commerce Core → Tenant System → UMKM A/B/C. Core menangani fungsi umum; tenant menyimpan konfigurasi & data bisnis masing-masing.

## 10. Tenant Model

Setiap customer bisnis = tenant: Branding, Domain, Theme, Pages, Products, Customers, Orders, Bookings, Invoices, Settings. Isolasi data & konfigurasi (no leakage).

## 11. Tenant Configuration

Identity (name, desc, logo, favicon, contact), Branding (colors, typography, theme), Website (domain, pages, nav, sections, SEO, social), Business (products, services, customers, bookings, orders, promos), Commerce (payment, invoice, inventory, shipping config), System (subscription, entitlements, notifications, users, security).

## 12. CMS Architecture

CMS = core component. Tenant kelola website tanpa source code. Struktur: Theme, Header, Navigation, Pages (Home/About/Services/Products/Contact), Sections, Media, Footer. Dukung template sebagai starting point.

## 13. Template System

Template dipisah dari business logic. Template hanya presentation/structure/layout/visual; logic dari core.

## 14. Initial Template Strategy

4 template awal: (01) Professional (Konsultan/Freelancer/Agency/Contractor), (02) Local Business (Salon/Barbershop/Laundry/Bengkel), (03) Product Business (Fashion/F&B/Retail/Handmade), (04) Service & Booking (Photographer/WO/Travel/Training/Studio).

## 15. Customer Onboarding

Pilih jenis bisnis → pilih template → nama bisnis → upload logo → produk/jasa → kontak → publish. Tanpa development manual.

## 16. Subscription & Feature Entitlement

Tenant → Subscription → Plan → Feature Entitlements (CMS/Booking/Order/Payment/Inventory/Reports). Perubahan plan = ubah entitlement, bukan struktur aplikasi.

## 17. Pricing Model

Setup Fee + Monthly Subscription (recurring). Validasi: target market, infra cost, payment cost, support, WTP, competitor, conversion, churn.

## 18. Scalability Principle

Codebase satu platform untuk semua tenant. Bug fix / new feature di core → semua tenant. (Bukan 100 customer × 100 website × 100 maintenance.)

## 19. Agency vs SaaS Model

Ubah dari project-based agency → recurring SaaS. Reusable platform, multi-tenant, centralized maintenance, scalable.

## 20. Product Positioning

Bukan "jasa pembuatan website murah". Positioning: "Platform digital untuk membantu bisnis membangun kehadiran online, menjalankan operasional, dan menerima transaksi." Website = entry point, Business tools = expansion, Commerce = monetization.

## 21. Relationship with Logikraf

Logikraf memiliki Horizontal SaaS (Business Website Platform → UMKM) & Vertical SaaS (SmartHub by Logikraf → community/residential). Dua produk beda identity/roadmap di bawah brand sama.

## 22. Strategic Product Flywheel

Client → Service → Repeated Problem → Reusable Solution → Product → SaaS → Recurring Revenue.

## 23. Product Development Principles

1. One Core  2. Multi-Tenant First  3. Feature Gating  4. Template Driven  5. Upgrade Without Migration  6. Reusable Modules  7. SaaS First  8. Product Before Customization.

## 24. Initial Product Scope

PHASE 1: Website Core + CMS + Tenant + Template + Starter. PHASE 2: Business Features + Products + Customers + Booking + Order + Analytics + Business Plan. PHASE 3: Commerce + Cart + Checkout + Payment + Invoice + Inventory + Reports + Commerce Plan.

## 25. Success Criteria

12 kriteria (tenant self-serve, template, no-code config, publish, domain, subscription gating, upgrade no-migration, one codebase, reusable template, centralized update, recurring payment).

## 26. Future Possibilities

Custom domain, AI website gen, AI content, SEO assistant, WhatsApp/Social integration, CRM, POS, advanced inventory, marketplace/shipping integration, advanced analytics, marketing automation, loyalty, membership, voucher, email marketing, segmentation, AI business assistant.

## 27. Final Product Definition

Satu platform SaaS multi-tenant: UMKM mulai dari website → business management → online commerce tanpa pindah platform. Starter→Business→Commerce, satu LOGIKRAF CORE. Strategi: "Build once. Configure many. Scale continuously."

## 28. Next Reference Documents

```
docs/products/website-platform/
├── PRODUCT_REQUIREMENTS.md
├── FEATURE_MATRIX.md
├── PRICING.md
├── ARCHITECTURE.md
├── TENANT_ARCHITECTURE.md
├── DATABASE.md
├── CMS.md
├── TEMPLATE_SYSTEM.md
├── BOOKING.md
├── CUSTOMER.md
├── ORDER.md
├── PAYMENT.md
├── INVOICE.md
├── INVENTORY.md
├── ANALYTICS.md
├── SUBSCRIPTION.md
├── FEATURE_GATING.md
└── ROADMAP.md
```

Product Reference ini menjadi baseline konseptual. Detail teknis, database, API, UI/UX, pricing final, dan implementation rules harus didefinisikan pada reference document masing-masing sebelum development dimulai.
