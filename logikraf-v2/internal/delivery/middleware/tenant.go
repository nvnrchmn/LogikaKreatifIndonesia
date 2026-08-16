package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// TenantFromHost resolves the tenant from the request Host subdomain
// (e.g. {slug}.logikraf.id) and stores tenant_id + tenant in locals.
// For custom domains (Phase 3) resolve by full host.
func TenantFromHost() fiber.Handler {
	return func(c fiber.Ctx) error {
		host := c.Hostname()
		host = strings.TrimSuffix(host, ":80")
		host = strings.TrimSuffix(host, ":443")

		var tenant model.Tenant

		// Skip for main domain / API / asset paths / unknown hosts
		if host == "logikraf.id" || host == "www.logikraf.id" || strings.HasPrefix(host, "api.") {
			return c.Next()
		}
		// Only resolve tenant for subdomains or explicit custom domains
		if !strings.HasSuffix(host, ".logikraf.id") {
			// try custom domain, else skip (don't 404 on main/api hosts)
			if err := model.DB.Where("domain = ?", host).First(&tenant).Error; err != nil {
				return c.Next()
			}
			c.Locals("tenant_id", tenant.ID)
			c.Locals("tenant", &tenant)
			return c.Next()
		}

		slug := strings.TrimSuffix(host, ".logikraf.id")
		if slug == "" || slug == "www" {
			return c.Next()
		}
		if err := model.DB.Where("slug = ?", slug).First(&tenant).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "tenant not found"})
		}

		c.Locals("tenant_id", tenant.ID)
		c.Locals("tenant", &tenant)
		return c.Next()
	}
}
