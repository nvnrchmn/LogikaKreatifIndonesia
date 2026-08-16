# ARCHITECTURE — Logikraf Business Website Platform

> Source: PRODUCT_REFERENCE.md (sections 3, 9, 10, 11, 16, 23)
> Status: Draft v0.1 — based on audit of existing `logikraf-v2` codebase (2026-08-16)

## 1. Current State (Audit)

Existing repo `logikraf-v2` (module `github.com/logikraf/logikraf-v2`):

| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Go 1.25 + Fiber v3 | Same stack as SmartHub (reuse patterns) |
| ORM | GORM | MySQL (prod `logikraf_v2`), SQLite (dev/test) |
| Auth | golang-jwt v5 | JWT bearer |
| Frontend | React + Vite | `frontend/` dir exists |
| Migrations | Raw SQL (`migrations/00x_*.sql`) | `001_base`, `002_full`, `003_seed` |

**Existing domain models:** client, package, invoice, lead, order, service, post, portfolio, testimonial, ticket, user, payment_account, setting, transaction.

**Gap vs PRODUCT_REFERENCE:** NO `tenant`, `plan`, `entitlement`, `subscription` models. Current schema is **agency-style** (per-client), not multi-tenant SaaS.

## 2. Target Architecture (Principle: One Core)

```
                    LOGIKRAF CORE (logikraf-v2, extended)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   Website CMS Core     Business Core          Commerce Core
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                       Tenant System
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
     UMKM A (Starter)    UMKM B (Business)    UMKM C (Commerce)
```

**Reuse, don't rewrite:** Extend `logikraf-v2` with new modules. Keep Fiber + GORM + React.

## 3. Multi-Tenant Strategy

**Shared database, shared schema** (per PRODUCT_REFERENCE §9, §10). Tenant isolation via `tenant_id` column on every business table.

- Tenant identified by **subdomain** (`{slug}.logikraf.id`) or **custom domain** (Phase 3).
- Middleware extracts `tenant_id` from Host header → injects into GORM scope (Row-Level Security pattern).
- No schema-per-tenant (avoids migration complexity at scale).

```
request → Host middleware → resolve tenant → set c.Locals("tenant_id") → handler scopes queries
```

## 4. Module Layout (extend existing)

```
internal/
  domain/model/        # + tenant.go, plan.go, entitlement.go, page.go, section.go, template.go
  infrastructure/db/   # + tenant scope helper
  delivery/handler/    # + tenant, cms, template handlers
  tenant/              # NEW: tenant service (create, resolve, config)
  cms/                 # NEW: page/section CRUD + render
  entitlement/         # NEW: plan → feature gate
migrations/
  004_tenant_system.sql
  005_cms.sql
```

## 5. Feature Gating (Principle 3)

Entitlement resolved at request time, not hard-coded:

```
Plan (Starter/Business/Commerce)
  → Entitlement map { cms:true, booking:false, payment:false, ... }
  → Middleware/guard checks entitlement before handler
```

Frontend: feature flags from `/tenant/entitlements` endpoint → hide/disable locked UI.

## 6. Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | Go + Fiber v3 | Already in repo, proven on SmartHub |
| DB | MySQL (shared schema + tenant_id) | Reuse `logikraf_v2`, no new infra |
| ORM | GORM | Already used |
| Frontend | React + Vite + Tailwind | Already used; same as SmartHub |
| Auth | JWT + tenant_id claim | Extend existing JWT |
| Rendering | **SPA (React + Vite)** | Decided 2026-08-16. One React app; tenant site = SPA fetching config from API. Reuse SmartHub frontend patterns. |

## 7. Open Questions

- SSR (Fiber template) vs SPA (React) for tenant websites? Affects CMS render layer.
- Subdomain wildcard DNS + TLS for `*.logikraf.id`?
- Plan storage: static enum vs DB table (DB = upgradeable without deploy).
