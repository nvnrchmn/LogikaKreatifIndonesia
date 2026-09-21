package handler

import (
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"

	"github.com/gofiber/fiber/v3"
)

const siteBaseURL = "https://logikraf.id"

var staticPaths = []string{"/", "/paket", "/jasa-pembuatan-aplikasi-web", "/portfolio", "/blog", "/faq", "/tentang-kami", "/kontak", "/kebijakan-refund", "/kebijakan-privasi", "/syarat-ketentuan"}

func GetSitemap(c fiber.Ctx) error {
	var b strings.Builder
	b.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	b.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + "\n")

	// ymd: ambil YYYY-MM-DD dengan aman (hindari panic bila updated_at NULL/kosong).
	ymd := func(s string) string {
		if len(s) >= 10 {
			return s[:10]
		}
		return ""
	}
	// xmlEsc: <loc> wajib XML-valid (slug bisa mengandung & atau karakter lain).
	xmlEsc := func(s string) string {
		return strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", "'", "&apos;", "\"", "&quot;").Replace(s)
	}
	write := func(path, lastmod string) {
		loc := siteBaseURL + xmlEsc(path)
		if lastmod != "" {
			b.WriteString("  <url><loc>" + loc + "</loc><lastmod>" + lastmod + "</lastmod></url>\n")
		} else {
			b.WriteString("  <url><loc>" + loc + "</loc></url>\n")
		}
	}
	for _, p := range staticPaths {
		write(p, "")
	}

	var slugDates []struct {
		Slug      string
		UpdatedAt string
	}
	model.DB.Model(&model.Portfolio{}).Where("is_published = ?", true).
		Select("slug, COALESCE(updated_at, created_at) AS updated_at").Scan(&slugDates)
	for _, s := range slugDates {
		write("/portfolio/"+s.Slug, ymd(s.UpdatedAt))
	}
	slugDates = nil
	model.DB.Model(&model.Post{}).Where("is_published = ?", true).
		Select("slug, COALESCE(updated_at, created_at) AS updated_at").Scan(&slugDates)
	for _, s := range slugDates {
		write("/blog/"+s.Slug, ymd(s.UpdatedAt))
	}

	b.WriteString("</urlset>")
	c.Set("Content-Type", "application/xml")
	return c.SendString(b.String())
}
