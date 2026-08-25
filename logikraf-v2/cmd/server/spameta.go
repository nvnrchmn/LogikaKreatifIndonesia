package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

var (
	spaHTML    string
	spaModTime time.Time
	titleRe    = regexp.MustCompile(`(<title>).*?(</title>)`)
)

func metaRe(name string) *regexp.Regexp {
	return regexp.MustCompile(`(<meta (?:name|property)="` + name + `" content=")[^"]*(")`)
}

func loadSpaHTML(frontendDir string) (string, error) {
	p := filepath.Join(frontendDir, "index.html")
	info, err := os.Stat(p)
	if err != nil {
		return "", err
	}
	if spaHTML != "" && !info.ModTime().After(spaModTime) {
		return spaHTML, nil
	}
	b, err := os.ReadFile(p)
	if err != nil {
		return "", err
	}
	spaHTML = string(b)
	spaModTime = info.ModTime()
	return spaHTML, nil
}

func escHTML(s string) string {
	r := strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", "\"", "&#34;")
	return r.Replace(s)
}

type pageMeta struct {
	Title       string
	Description string
	OGImage     string
	Schema      string
}

func serveSPAWithMeta(c fiber.Ctx, frontendDir string, m *pageMeta) error {
	html, err := loadSpaHTML(frontendDir)
	if err != nil {
		return c.Status(500).SendString("server error")
	}
	if m != nil && m.Title != "" {
		t := escHTML(m.Title)
		html = titleRe.ReplaceAllString(html, "${1}"+t+"${2}")
		html = metaRe("og:title").ReplaceAllString(html, "${1}"+t+"${2}")
	}
	if m != nil && m.Description != "" {
		d := escHTML(m.Description)
		html = metaRe("description").ReplaceAllString(html, "${1}"+d+"${2}")
		html = metaRe("og:description").ReplaceAllString(html, "${1}"+d+"${2}")
	}
	if m != nil && m.OGImage != "" {
		img := m.OGImage
		if !strings.HasPrefix(img, "http") {
			img = "https://logikraf.id" + img
		}
		html = metaRe("og:image").ReplaceAllString(html, "${1}"+img+"${2}")
	}
	if m != nil && m.Schema != "" {
		inject := "\n    <script type=\"application/ld+json\">" + m.Schema + "</script>"
		html = strings.Replace(html, "</head>", inject+"\n</head>", 1)
	}
	c.Set("Content-Type", "text/html; charset=utf-8")
	c.Set("Cache-Control", "no-cache")
	return c.SendString(html)
}

func blogMeta(slug string) *pageMeta {
	var title, excerpt string
	var img *string
	var pub time.Time
	err := model.DB.Raw(
		"SELECT title, COALESCE(excerpt, LEFT(body, 155)), featured_image, COALESCE(published_at, created_at) FROM posts WHERE slug=? AND is_published=1 AND deleted_at IS NULL",
		slug,
	).Row().Scan(&title, &excerpt, &img, &pub)
	if err != nil || title == "" {
		return nil
	}
	ogImage := ""
	if img != nil {
		ogImage = *img
	}
	suffix := " | Logika Kreatif Indonesia"
	if len(title)+len(suffix) <= 65 {
		title += suffix
	}
	excerpt = strings.ReplaceAll(excerpt, "\n", " ")
	excerpt = strings.NewReplacer("<", "", ">", "").Replace(excerpt)
	if len(excerpt) > 160 {
		excerpt = excerpt[:157] + "..."
	}
	schema := fmt.Sprintf(
		`{"@context":"https://schema.org","@type":"BlogPosting","headline":"%s","description":"%s","datePublished":"%s","author":{"@type":"Organization","name":"Logika Kreatif Indonesia"},"publisher":{"@type":"Organization","name":"Logika Kreatif Indonesia"}}`,
		escHTML(title), escHTML(excerpt), pub.Format(time.RFC3339),
	)
	return &pageMeta{Title: title, Description: excerpt, OGImage: ogImage, Schema: schema}
}

var _ = filepath.Join
