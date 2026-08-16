# ROADMAP — Logikraf Business Website Platform

> Source: PRODUCT_REFERENCE.md (sections 24, 26, 27)
> Status: Draft v0.1

## Phases

### PHASE 1 — Website Core + CMS + Tenant + Template + Starter
**Goal:** Customer can self-serve create a Starter website without code.

Scope:
- [ ] Tenant system (model, migration, Host middleware, isolation)
- [ ] Plan + Entitlement (Starter baseline)
- [ ] Onboarding flow (pick business type → template → name → logo → publish)
- [ ] CMS: pages, sections, media, theme
- [ ] Template system: 4 initial templates (Professional, Local Business, Product, Service&Booking)
- [ ] Public site render (Starter features only)
- [ ] Subdomain routing (`{slug}.logikraf.id`)

Success: 12 criteria §25 met for Starter.

### PHASE 2 — Business Features
- [ ] Products / Categories
- [ ] Customers / Lead management
- [ ] Booking
- [ ] Order (form order)
- [ ] Blog/Articles
- [ ] Promo
- [ ] Analytics (advanced)
- [ ] Business Plan + entitlement unlock

### PHASE 3 — Commerce
- [ ] Cart / Checkout
- [ ] Payment gateway (iPaymu/Midtrans — reuse SmartHub integration)
- [ ] Invoice
- [ ] Inventory + variants
- [ ] Order management / Sales / Payment reports
- [ ] Shipping integration
- [ ] Commerce Plan + entitlement unlock

## MVP Definition (start here)

**Thinnest slice that proves the model:**
1. Create tenant via API
2. Assign Starter plan → entitlements
3. Pick template → default pages seeded
4. Edit business name/logo/contact in CMS
5. Publish → live at subdomain
6. Visitor sees website

Everything else (Business/Commerce, custom domain, AI) = later.

## Future (§26, post-core-stable)
Custom domain, AI website gen, AI content, SEO assistant, WhatsApp/Social, CRM, POS, marketplace, loyalty, email marketing, segmentation, AI assistant.

## Sequencing Principle
Build once → Configure many → Scale continuously. Each Phase extends core, never forks codebase.
