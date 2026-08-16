package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// GetSitePublic returns the tenant website config + pages for the resolved tenant.
// Used by SPA tenant site. Resolved via TenantFromHost middleware.
func GetSitePublic(c fiber.Ctx) error {
	t, ok := c.Locals("tenant").(*model.Tenant)
	if !ok || t.ID == 0 {
		return c.JSON(fiber.Map{"tenant": nil, "pages": []interface{}{}})
	}

	var pages []model.Page
	model.DB.Where("tenant_id = ? AND published = ?", t.ID, true).
		Order("sort_order asc").Find(&pages)

	// attach sections to each page
	type PageWithSections struct {
		model.Page
		Sections []model.Section `json:"sections"`
	}
	out := make([]PageWithSections, 0, len(pages))
	for _, p := range pages {
		var secs []model.Section
		model.DB.Where("page_id = ?", p.ID).Order("sort_order asc").Find(&secs)
		out = append(out, PageWithSections{Page: p, Sections: secs})
	}

	return c.JSON(fiber.Map{
		"tenant": fiber.Map{
			"id":            t.ID,
			"slug":          t.Slug,
			"business_name": t.BusinessName,
			"description":   t.Description,
			"logo_url":      t.LogoURL,
			"whatsapp":      t.WhatsApp,
			"contact_email": t.ContactEmail,
			"contact_phone": t.ContactPhone,
			"address":       t.Address,
			"maps_embed":    t.MapsEmbed,
			"theme_json":    t.ThemeJSON,
			"seo_json":      t.SEOJSON,
			"social_json":   t.SocialJSON,
		},
		"pages": out,
	})
}

// CreateTenant creates a new tenant (onboarding step 1).
func CreateTenant(c fiber.Ctx) error {
	var t model.Tenant
	if err := c.Bind().JSON(&t); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	// default to Starter plan
	if t.PlanID == 0 {
		var p model.Plan
		model.DB.Where("code = ?", "starter").First(&p)
		t.PlanID = p.ID
	}
	// JSON columns need valid JSON, not empty string
	if t.ThemeJSON == "" {
		t.ThemeJSON = "{}"
	}
	if t.SEOJSON == "" {
		t.SEOJSON = "{}"
	}
	if t.SocialJSON == "" {
		t.SocialJSON = "{}"
	}
	if err := model.DB.Create(&t).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	// Auto-seed Starter default pages (onboarding: template pages)
	seedStarterPages(t.ID)
	return c.Status(201).JSON(t)
}

// seedStarterPages creates default Starter pages + hero section for a tenant.
func seedStarterPages(tenantID uint) {
	pages := []model.Page{
		{TenantID: tenantID, Slug: "home", Title: "Beranda", Published: true, SortOrder: 0, MetaJSON: "{}"},
		{TenantID: tenantID, Slug: "about", Title: "Tentang", Published: true, SortOrder: 1, MetaJSON: "{}"},
		{TenantID: tenantID, Slug: "services", Title: "Layanan", Published: true, SortOrder: 2, MetaJSON: "{}"},
		{TenantID: tenantID, Slug: "contact", Title: "Kontak", Published: true, SortOrder: 3, MetaJSON: "{}"},
	}
	model.DB.Create(&pages)
	var home model.Page
	model.DB.Where("tenant_id = ? AND slug = ?", tenantID, "home").First(&home)
	model.DB.Create(&model.Section{
		PageID:     home.ID,
		Type:       "hero",
		ContentJSON: `{"heading":"` + getBizName(tenantID) + `","subheading":"Selamat datang di website kami","cta":"Hubungi Kami","cta_url":"#contact"}`,
		SortOrder:  0,
	})
}

func getBizName(tenantID uint) string {
	var t model.Tenant
	model.DB.First(&t, tenantID)
	return t.BusinessName
}

// ListTenants admin listing.
func ListTenants(c fiber.Ctx) error {
	var ts []model.Tenant
	model.DB.Find(&ts)
	return c.JSON(ts)
}

// HasEntitlement checks if the tenant's plan enables a feature.
func HasEntitlement(tenantID uint, feature string) bool {
	var t model.Tenant
	if err := model.DB.First(&t, tenantID).Error; err != nil {
		return false
	}
	var e model.Entitlement
	if err := model.DB.Where("plan_id = ? AND feature = ?", t.PlanID, feature).First(&e).Error; err != nil {
		return false
	}
	return e.Enabled
}
