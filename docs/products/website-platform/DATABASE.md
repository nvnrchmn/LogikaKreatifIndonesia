# DATABASE — Logikraf Business Website Platform

> Source: PRODUCT_REFERENCE.md (sections 10, 11, 16) + audit of `logikraf_v2`
> Status: Draft v0.1 — Phase 1 scope (Tenant + Plan + Entitlement + CMS)

## Strategy
**Shared schema, shared database.** Every business table gets `tenant_id`. No schema-per-tenant. Tenant isolation via GORM scope (`WHERE tenant_id = ?`).

## New Tables (Phase 1)

### tenants
```sql
CREATE TABLE tenants (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  slug          VARCHAR(64)  NOT NULL UNIQUE,   -- subdomain: {slug}.logikraf.id
  business_name VARCHAR(160) NOT NULL,
  description   TEXT,
  logo_url      VARCHAR(512),
  favicon_url   VARCHAR(512),
  contact_email VARCHAR(160),
  contact_phone VARCHAR(40),
  address       VARCHAR(255),
  maps_embed    TEXT,                              -- Google Maps embed
  whatsapp     VARCHAR(40),                       -- CTA number
  domain       VARCHAR(255) DEFAULT NULL,         -- custom domain (Phase 3)
  plan_id      BIGINT       NOT NULL,
  theme_json   JSON,                               -- {primary, secondary, typography}
  seo_json     JSON,                               -- {title, description, og_image}
  social_json  JSON,                               -- {facebook, instagram, ...}
  created_at   DATETIME,
  updated_at   DATETIME,
  INDEX idx_tenant_slug (slug)
);
```

### plans
```sql
CREATE TABLE plans (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  code        VARCHAR(32) NOT NULL UNIQUE,  -- starter | business | commerce
  name        VARCHAR(80) NOT NULL,
  price_month INT NOT NULL DEFAULT 0,       -- IDR/month
  setup_fee   INT NOT NULL DEFAULT 0
);
```

### entitlements
```sql
CREATE TABLE entitlements (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  plan_id     BIGINT NOT NULL,
  feature     VARCHAR(64) NOT NULL,         -- cms, booking, payment, inventory, ...
  enabled     TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_ent_plan (plan_id)
);
-- Seed: starter -> cms=1, others=0; business adds booking/order; commerce adds payment/inventory
```

### pages
```sql
CREATE TABLE pages (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id  BIGINT NOT NULL,
  slug       VARCHAR(64) NOT NULL,          -- home, about, services, products, contact
  title      VARCHAR(160),
  meta_json  JSON,
  published  TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  UNIQUE KEY uk_tenant_page (tenant_id, slug)
);
```

### sections
```sql
CREATE TABLE sections (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  page_id    BIGINT NOT NULL,
  type       VARCHAR(64) NOT NULL,          -- hero, text, gallery, contact, products_showcase
  content_json JSON,                         -- template-specific content
  sort_order INT DEFAULT 0
);
```

### media
```sql
CREATE TABLE media (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id  BIGINT NOT NULL,
  url        VARCHAR(512) NOT NULL,
  alt        VARCHAR(160),
  created_at DATETIME
);
```

## Reuse Existing Tables
`users` (extend with `tenant_id`, `role`), `settings` (per-tenant via tenant_id), `posts` (blog — Business tier).

## Tenant Isolation Pattern
```go
// middleware resolves tenant from Host, sets c.Locals("tenant_id")
// every query: db.Where("tenant_id = ?", tenantID).Find(&x)
```

## Migration Files
- `migrations/004_tenant_system.sql` — tenants, plans, entitlements + seed (3 plans, Starter entitlements)
- `migrations/005_cms.sql` — pages, sections, media
