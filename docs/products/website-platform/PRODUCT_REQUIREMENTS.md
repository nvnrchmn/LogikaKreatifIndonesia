# PRODUCT_REQUIREMENTS — Phase 1 (MVP)

> Source: PRODUCT_REFERENCE.md (sections 5, 12, 14, 15, 24, 25)
> Status: Draft v0.1 — scoped to Phase 1 only

## 1. Goal
Customer (UMKM) creates a live Starter website via self-service, no code, no Logikraf dev involvement.

## 2. Functional Requirements

### FR-1 Tenant Management
- FR-1.1 Create tenant (business name, slug, contact, logo)
- FR-1.2 Resolve tenant by subdomain (`{slug}.logikraf.id`)
- FR-1.3 Tenant data isolation (tenant_id on all tables)
- FR-1.4 Tenant config: branding (colors, theme), SEO metadata, social links

### FR-2 Plan & Entitlement
- FR-2.1 Assign Starter plan on create
- FR-2.2 Entitlement map: Starter = { cms, pages, gallery, contact, maps, whatsapp, seo_basic, ssl, hosting }
- FR-2.3 Entitlement check guard (deny Business/Commerce features)

### FR-3 CMS
- FR-3.1 CRUD pages (Home, About, Services, Products, Contact)
- FR-3.2 CRUD sections within pages
- FR-3.3 Media library (upload logo, images)
- FR-3.4 Theme: primary/secondary color, typography
- FR-3.5 No-code editing (no source change)

### FR-4 Template System
- FR-4.1 4 templates: Professional, Local Business, Product Business, Service & Booking
- FR-4.2 Template = presentation only; logic from core
- FR-4.3 Pick template at onboarding → seed default pages

### FR-5 Onboarding
- FR-5.1 Flow: business type → template → name → logo → products/services → contact → publish
- FR-5.2 Publish → live subdomain

### FR-6 Public Render
- FR-6.1 Serve tenant website at subdomain
- FR-6.2 Mobile responsive, SSL
- FR-6.3 SEO basic (title, meta, og tags)

## 3. Non-Functional
- NFR-1 Shared schema, tenant-scoped (no per-tenant DB)
- NFR-2 Reuse Go Fiber + GORM + React (no new stack)
- NFR-3 Upgrade Starter→Business later = entitlement change, no migration

## 4. Out of Scope (Phase 1)
Booking, Orders, Payment, Inventory, Blog (Business tier), Custom domain, AI.

## 5. Success Criteria (from §25, Starter subset)
1. Customer creates tenant ✓
2. Picks template ✓
3. Configures without coding ✓
4. Publishes ✓
5. Uses subdomain ✓
6. Subscription gates features ✓
7. One codebase, many tenants ✓
