# Graph Report - LogikaKreatifIndonesia  (2026-08-14)

## Corpus Check
- 131 files · ~65,297 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 773 nodes · 887 edges · 103 communities (62 shown, 41 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `817dd17f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- AdminDashboardPage.tsx
- ClientLayout.tsx
- payment.go
- What You Must Do When Invoked
- compilerOptions
- auth.go
- PackageTest
- compilerOptions
- AdminLayout.tsx
- compilerOptions
- 2. Agnostic Payment Gateway Module Architecture
- ADR-005: Multi-Tenant Payment Hub
- App.tsx
- PublicLayout.tsx
- ai-ui-ux-theme-style.md
- react
- PublicLayout
- 3. Core Features & Scope of Work (Ruang Lingkup Proyek)
- Fitur & Perubahan yang Ditambahkan:
- Logika Kreatif Indonesia - Future Features Planning
- AdminResourcePage.tsx
- graphify reference: extra exports and benchmark
- Panduan Deployment logikraf.id (DirectAdmin / Shared Hosting)
- Panduan Integrasi SB Digital dengan Logikraf Payment Hub (xenPlatform)
- plugins
- ClientDashboardPage.tsx
- Panduan Integrasi Logikraf Payment Hub (XenPlatform)
- ReportsPage.tsx
- README.md
- Tech Stack Specification: logikraf.id
- ServiceShowcase.tsx
- ClientOrdersPage.tsx
- handler_test.go
- handler/invoice.go
- handler/post.go
- handler/transaction.go
- graphify reference: query, path, explain
- Hasil Analisis Payment Gateway - Logika Kreatif Indonesia
- handler/client.go
- handler/lead.go
- handler/order.go
- handler/portfolio.go
- handler/testimonial.go
- handler/ticket.go
- [Unreleased] - 2026-07-12
- Update 2026-07-12: Dynamic Platform Fee & Disbursement Engine
- Changelog - Fase 2 & UI/UX Refinements
- Changelog: 12 Juli 2026 - Payment Hub (xenPlatform)
- Settings/SettingsPage.tsx
- package_crud.go
- service_crud.go
- settings.go
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- React + TypeScript + Vite
- ContactPage.tsx
- FaqPage.tsx
- handler/service.go
- model/payment_account.go
- ExampleTest
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Changelog - 12 Juli 2026
- BlogPage.tsx
- PortfolioDetailPage.tsx
- public/ServicesPage.tsx
- TermsPage.tsx
- smoke.sh
- frontend/tsconfig.json
- GetPackages
- GetFinanceReport
- GetSitemap
- Client
- Invoice
- Lead
- Order
- Package
- Portfolio
- Post
- Service
- Setting
- Testimonial
- Ticket
- Transaction
- User
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- .claude/CLAUDE.md
- extraction-spec.md
- TestimonialsSection.tsx
- add_soft_deletes.php
- github.com/logikraf/logikraf-v2
- SearchPage.tsx
- public/ServicesPage.tsx
- public/ServicesPage.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 40 edges
2. `compilerOptions` - 18 edges
3. `compilerOptions` - 17 edges
4. `compilerOptions` - 15 edges
5. `PublicLayout()` - 12 edges
6. `apiGet()` - 12 edges
7. `What You Must Do When Invoked` - 12 edges
8. `useAuth()` - 11 edges
9. `/graphify` - 11 edges
10. `ADR-005: Multi-Tenant Payment Hub` - 11 edges

## Surprising Connections (you probably didn't know these)
- `RefundPaymentTransaction()` --calls--> `setting()`  [INFERRED]
  logikraf-v2/internal/delivery/handler/payment_account.go → logikraf-v2/internal/delivery/handler/payment.go
- `ForcePasswordReset()` --calls--> `HashPassword()`  [INFERRED]
  logikraf-v2/internal/delivery/handler/payment.go → logikraf-v2/pkg/auth/auth.go
- `main()` --calls--> `AdminOnly()`  [INFERRED]
  logikraf-v2/cmd/server/main.go → logikraf-v2/pkg/auth/auth.go
- `main()` --calls--> `AuthMiddleware()`  [INFERRED]
  logikraf-v2/cmd/server/main.go → logikraf-v2/pkg/auth/auth.go
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  logikraf-v2/frontend/src/App.tsx → logikraf-v2/frontend/src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (103 total, 41 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (41): @ant-design/icons, antd, dependencies, @ant-design/icons, antd, react, react-dom, react-router-dom (+33 more)

### Community 1 - "AdminDashboardPage.tsx"
Cohesion: 0.09
Nodes (31): apiGet(), apiPost(), apiPut(), auth(), Activity, AdminDashboardPage(), AnyArr, get() (+23 more)

### Community 3 - "payment.go"
Cohesion: 0.23
Nodes (20): xenditInvoiceRequest, activeGatewayIDs(), GetPaymentGateways(), Ctx, calcFee(), CreateIpaymuPayment(), CreateMidtransSnap(), CreateXenditInvoice() (+12 more)

### Community 4 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 5 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, jsx, lib, module, moduleDetection, moduleResolution (+15 more)

### Community 6 - "auth.go"
Cohesion: 0.14
Nodes (19): Claims, LoginRequest, main(), Handler, T, migratePaymentTables(), postJSON(), TestForcePasswordReset() (+11 more)

### Community 7 - "PackageTest"
Cohesion: 0.43
Nodes (3): usePageMeta(), Root(), react

### Community 8 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, allowJs, allowSyntheticDefaultImports, esModuleInterop, isolatedModules, lib, module (+14 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 11 - "2. Agnostic Payment Gateway Module Architecture"
Cohesion: 0.13
Nodes (14): 1.1 Stack Specification, 1.2 Architecture Pattern, 1. Core System & Tech Stack Rules, 2.1 The Contract (Interface), 2.2 Dynamic Service Binding, 2. Agnostic Payment Gateway Module Architecture, 3. Database Schema Blueprint, 4. Local File Storage Security Rules (+6 more)

### Community 12 - "ADR-005: Multi-Tenant Payment Hub"
Cohesion: 0.13
Nodes (14): 10. References, 1. Context, 2. Decision, 3. Multi-Tenancy Model, 4. Database Schema, 5. API Endpoints, 6. Fee Engine, 7. Frontend (Admin) (+6 more)

### Community 13 - "App.tsx"
Cohesion: 0.05
Nodes (41): AboutPage, AdminDashboardPage, AdminLayout, AdminLoginPage, AdminPaymentHubPage, AdminPaymentLedgerPage, AdminReconciliationPage, AdminReportsPage (+33 more)

### Community 14 - "PublicLayout.tsx"
Cohesion: 0.31
Nodes (4): Footer(), NavbarProps, Props, HomePage()

### Community 15 - "ai-ui-ux-theme-style.md"
Cohesion: 0.15
Nodes (12): 01_PROJECT_OVERVIEW.md, 02_TAILWIND_V4_THEME_CONFIG.md, 03_COMPONENT_LIBRARY.md, 04_RESPONSIVE_BREAKPOINTS.md, 05_DEPLOYMENT_PLAYBOOK.md, 10. Documentation & Knowledge Base, 1. Visual Vibe & Design Philosophy, 2. Color System & Theme Variables (+4 more)

### Community 17 - "PublicLayout"
Cohesion: 0.22
Nodes (3): PublicLayout(), Post, Post

### Community 18 - "3. Core Features & Scope of Work (Ruang Lingkup Proyek)"
Cohesion: 0.20
Nodes (9): 1. Executive Summary, 2. Target Audiens, 3.1 Dynamic Showcase & Deep-Dive Portfolio System, 3.2 Lead Capture & CRM Hub, 3.3 Agnostic Digital Transaction & Milestone Billing Modul, 3.4 Secure Administrative Panel, 3. Core Features & Scope of Work (Ruang Lingkup Proyek), 4. Key Performance & Success Metrics (+1 more)

### Community 19 - "Fitur & Perubahan yang Ditambahkan:"
Cohesion: 0.20
Nodes (9): 1. Sistem Pembayaran & Invoicing (Xendit), 2. Website Publik (Fase 4), 3. Pemolesan UI/UX & Responsivitas (Mobile), Changelog: 11 Juli 2026, Fitur & Perubahan yang Ditambahkan:, Klien dan Integrasi Xendit, Pengaturan Global & Notifikasi Email, Sistem Deploy Otomatis (CI/CD Webhook) (+1 more)

### Community 20 - "Logika Kreatif Indonesia - Future Features Planning"
Cohesion: 0.20
Nodes (9): 1. 🗂️ Sistem Manajemen Aset & Berbagi File (Asset Vault), 2. 📝 Kontrak Digital & Tanda Tangan Elektronik (e-Signature), 3. 💬 In-App Messaging / Komentar Proyek (Project Thread), 4. 🎫 Sistem Tiket Bantuan (Helpdesk & Support), 5. 📊 Papan Pantau Progress (Kanban/Task Board), 6. 💳 Integrasi Checkout Penuh Payment Gateway (Direct Pay), 7. 🎁 Program Referral / Afiliasi, Langkah Selanjutnya: (+1 more)

### Community 21 - "AdminResourcePage.tsx"
Cohesion: 0.33
Nodes (7): auth(), ResourceForm(), ResourceList(), ColumnDef, crudConfigs, FieldDef, ResourceConfig

### Community 22 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 23 - "Panduan Deployment logikraf.id (DirectAdmin / Shared Hosting)"
Cohesion: 0.33
Nodes (5): 1. Arsitektur Deployment, 2. Alur CI/CD Otomatis, 3. Konfigurasi Service Systemd (`/etc/systemd/system/logikraf-api.service`), 4. Konfigurasi Nginx Reverse Proxy (`/etc/nginx/sites-available/logikraf.id`), Panduan Deployment logikraf.id (VPS Ubuntu + Nginx + Systemd)

### Community 24 - "Panduan Integrasi SB Digital dengan Logikraf Payment Hub (xenPlatform)"
Cohesion: 0.22
Nodes (8): 1. Persiapan Awal, 2. Alur Pembayaran (Flow), 3. Dokumentasi API (Endpoints), 4. Menangkap Webhook (Konfirmasi Pembayaran), A. Membuat Sub-Account (Saat RT Baru Mendaftar), B. Membuat Tagihan Iuran Warga, C. Menarik Dana (Disbursement / Payout), Panduan Integrasi SB Digital dengan Logikraf Payment Hub (xenPlatform)

### Community 25 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 26 - "ClientDashboardPage.tsx"
Cohesion: 0.40
Nodes (3): mockServices, Service, ServiceFeature

### Community 27 - "Panduan Integrasi Logikraf Payment Hub (XenPlatform)"
Cohesion: 0.25
Nodes (7): 1. Membuat Sub-Account (Penjual/Merchant), 2. Membuat Invoice (Checkout Pembayaran), 3. Cek Status Invoice, 4. Pencairan Dana (Disbursement), 5. Webhook Forwarding (Callback), Base URL & Autentikasi, Panduan Integrasi Logikraf Payment Hub (XenPlatform)

### Community 28 - "ReportsPage.tsx"
Cohesion: 0.09
Nodes (9): mockOrders, Order, statusColors, FinanceReport, statMeta, mockTxns, statusColors, Transaction (+1 more)

### Community 29 - "README.md"
Cohesion: 0.25
Nodes (7): 1. Backend (Go), 2. Frontend (React + Vite), 🚢 Deployment (CI/CD), Logika Kreatif Indonesia (logikraf.id), 🛠️ Panduan Menjalankan Lokal, 📁 Struktur Direktori, 🚀 Tech Stack

### Community 30 - "Tech Stack Specification: logikraf.id"
Cohesion: 0.29
Nodes (6): 1. Backend Core & Framework Layer, 2. Frontend & Reactive Layer, 3. Data & Storage Layer, 4. Payment Integration & External API Modul, 5. Deployment & DevOps Stack (Target Environment), Tech Stack Specification: logikraf.id

### Community 31 - "ServiceShowcase.tsx"
Cohesion: 0.38
Nodes (6): categoryLabel(), fallbackServices, iconFor(), icons, Service, ServiceShowcase()

### Community 32 - "ClientOrdersPage.tsx"
Cohesion: 0.38
Nodes (5): ClientOrdersPage(), fmt(), fmtDate(), Order, statusStyle

### Community 33 - "handler_test.go"
Cohesion: 0.38
Nodes (6): T, TestCreateThenGetTransaction(), TestFinanceReport(), TestGetTransactions(), TestMain(), M

### Community 34 - "handler/invoice.go"
Cohesion: 0.48
Nodes (6): CreateInvoice(), DeleteInvoice(), DownloadInvoicePDF(), GetInvoices(), Ctx, UpdateInvoice()

### Community 35 - "handler/post.go"
Cohesion: 0.48
Nodes (6): CreatePost(), DeletePost(), GetPostBySlug(), GetPosts(), Ctx, UpdatePost()

### Community 36 - "handler/transaction.go"
Cohesion: 0.48
Nodes (6): CreateTransaction(), DeleteTransaction(), GetTransactionByID(), GetTransactions(), Ctx, UpdateTransaction()

### Community 37 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 38 - "Hasil Analisis Payment Gateway - Logika Kreatif Indonesia"
Cohesion: 0.33
Nodes (5): 1. Konfigurasi dan Library yang Tersedia, 2. Implementasi Payment Gateway (Core), 3. Integrasi XenPlatform (Payment Hub), Hasil Analisis Payment Gateway - Logika Kreatif Indonesia, Kesimpulan

### Community 39 - "handler/client.go"
Cohesion: 0.53
Nodes (5): CreateClient(), DeleteClient(), GetClients(), Ctx, UpdateClient()

### Community 40 - "handler/lead.go"
Cohesion: 0.53
Nodes (5): CreateLead(), DeleteLead(), GetLeads(), Ctx, UpdateLead()

### Community 41 - "handler/order.go"
Cohesion: 0.53
Nodes (5): CreateOrder(), DeleteOrder(), GetOrders(), Ctx, UpdateOrder()

### Community 42 - "handler/portfolio.go"
Cohesion: 0.53
Nodes (5): CreatePortfolio(), DeletePortfolio(), GetPortfolios(), Ctx, UpdatePortfolio()

### Community 43 - "handler/testimonial.go"
Cohesion: 0.53
Nodes (5): CreateTestimonial(), DeleteTestimonial(), GetTestimonials(), Ctx, UpdateTestimonial()

### Community 44 - "handler/ticket.go"
Cohesion: 0.53
Nodes (5): CreateTicket(), DeleteTicket(), GetTickets(), Ctx, UpdateTicket()

### Community 45 - "[Unreleased] - 2026-07-12"
Cohesion: 0.40
Nodes (4): Added (Fase 1), Changelog, Fixed, [Unreleased] - 2026-07-12

### Community 46 - "Update 2026-07-12: Dynamic Platform Fee & Disbursement Engine"
Cohesion: 0.40
Nodes (4): 1. Dynamic Platform Fee, 2. Disbursement Engine (Penarikan Dana), 3. Penyempurnaan UI/UX Admin Portal, Update 2026-07-12: Dynamic Platform Fee & Disbursement Engine

### Community 47 - "Changelog - Fase 2 & UI/UX Refinements"
Cohesion: 0.40
Nodes (4): Changelog - Fase 2 & UI/UX Refinements, File yang Berubah, Fitur Baru (Fase 2 - Helpdesk & Kanban), Perbaikan UI/UX (Refinements)

### Community 48 - "Changelog: 12 Juli 2026 - Payment Hub (xenPlatform)"
Cohesion: 0.40
Nodes (4): Changelog: 12 Juli 2026 - Payment Hub (xenPlatform), Fitur Baru (Backend & API), Perbaikan Bug & Refactoring, UI/UX & Admin Portal

### Community 50 - "package_crud.go"
Cohesion: 0.60
Nodes (4): CreatePackage(), DeletePackage(), Ctx, UpdatePackage()

### Community 51 - "service_crud.go"
Cohesion: 0.60
Nodes (4): CreateService(), DeleteService(), Ctx, UpdateService()

### Community 52 - "settings.go"
Cohesion: 0.73
Nodes (5): GetSetting(), Ctx, ListSettings(), resolveTenant(), SetSetting()

### Community 53 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 54 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 55 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 56 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 59 - "handler/service.go"
Cohesion: 0.67
Nodes (3): GetServiceBySlug(), GetServices(), Ctx

### Community 60 - "model/payment_account.go"
Cohesion: 0.67
Nodes (3): Time, PaymentTransaction, TenantPaymentAccount

### Community 61 - "ExampleTest"
Cohesion: 0.33
Nodes (4): Invoice, InvoiceItem, mockInvoices, statusColors

### Community 67 - "public/ServicesPage.tsx"
Cohesion: 0.53
Nodes (5): GetReconciliation(), Ctx, ListPaymentTransactions(), ListTenantPaymentAccounts(), RefundPaymentTransaction()

## Knowledge Gaps
- **314 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+309 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `PackageTest` to `AdminDashboardPage.tsx`, `ClientLayout.tsx`, `AdminLayout.tsx`, `App.tsx`, `PublicLayout.tsx`, `react`, `PublicLayout`, `AdminResourcePage.tsx`, `plugins`, `ClientDashboardPage.tsx`, `ReportsPage.tsx`, `ServiceShowcase.tsx`, `ClientOrdersPage.tsx`, `Settings/SettingsPage.tsx`, `ContactPage.tsx`, `FaqPage.tsx`, `ExampleTest`, `BlogPage.tsx`, `PortfolioDetailPage.tsx`, `TermsPage.tsx`, `TestimonialsSection.tsx`, `add_soft_deletes.php`, `SearchPage.tsx`, `public/ServicesPage.tsx`, `public/ServicesPage.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `PackageTest`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _314 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `AdminDashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0858974358974359 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._