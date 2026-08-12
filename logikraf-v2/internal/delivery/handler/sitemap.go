package handler

import (
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

const siteBaseURL = "https://logikraf.id"

var staticPaths = []string{"/", "/layanan", "/paket", "/blog", "/tentang-kami", "/kontak", "/kebijakan-privasi", "/syarat-ketentuan"}

func GetSitemap(c fiber.Ctx) error {
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	b.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + "\n")

	write := func(path string) {
		b.WriteString("  <url><loc>" + siteBaseURL + path + "</loc></url>\n")
	}
	for _, p := range staticPaths {
		write(p)
	}

	var slugs []string
	model.DB.Model(&model.Service{}).Pluck("slug", &slugs)
	for _, s := range slugs {
		write("/layanan/" + s)
	}
	slugs = nil
	model.DB.Model(&model.Portfolio{}).Where("is_published = ?", true).Pluck("slug", &slugs)
	for _, s := range slugs {
		write("/portfolio/" + s)
	}
	slugs = nil
	model.DB.Model(&model.Post{}).Where("is_published = ?", true).Pluck("slug", &slugs)
	for _, s := range slugs {
		write("/blog/" + s)
	}

	b.WriteString("</urlset>")
	c.Set("Content-Type", "application/xml")
	return c.SendString(b.String())
}
