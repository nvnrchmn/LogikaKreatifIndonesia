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
	spaHTML     string
	spaModTime  time.Time
	titleRe     = regexp.MustCompile(`(<title>).*?(</title>)`)
	canonicalRe = regexp.MustCompile(`(<link rel="canonical" href=")[^"]*(")`)
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
	OGType      string
	OGLocale    string
	OGSiteName  string
	TwitterCard string
	Schema      string
	Breadcrumb  string
}

func serveSPAWithMeta(c fiber.Ctx, frontendDir string, m *pageMeta) error {
	html, err := loadSpaHTML(frontendDir)
	if err != nil {
		return c.Status(500).SendString("server error")
	}
	// Canonical WAJIB self-referential per URL. Sebelumnya canonical warisan
	// index.html selalu "https://logikraf.id/", sehingga SEMUA halaman (termasuk
	// artikel blog) mengaku duplikat homepage → berisiko tidak diindeks Google.
	p := c.Path()
	if p == "" {
		p = "/"
	}
	if len(p) > 1 {
		p = strings.TrimSuffix(p, "/")
	}
	host := c.Hostname()
	switch host {
	case "", "logikraf.id", "www.logikraf.id":
		host = "logikraf.id"
	}
	html = canonicalRe.ReplaceAllString(html, "${1}https://"+host+p+"${2}")
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
	// OpenGraph type, locale, site_name
	if m != nil && m.OGType != "" {
		html = metaRe("og:type").ReplaceAllString(html, "${1}"+m.OGType+"${2}")
	}
	if m != nil && m.OGLocale != "" {
		if !strings.Contains(html, "og:locale") {
			html = strings.Replace(html, "</head>", "    <meta property=\"og:locale\" content=\""+m.OGLocale+"\" />\n</head>", 1)
		} else {
			html = metaRe("og:locale").ReplaceAllString(html, "${1}"+m.OGLocale+"${2}")
		}
	}
	if m != nil && m.OGSiteName != "" {
		html = metaRe("og:site_name").ReplaceAllString(html, "${1}"+m.OGSiteName+"${2}")
	}
	// Twitter Card
	if m != nil && m.TwitterCard != "" {
		html = metaRe("twitter:card").ReplaceAllString(html, "${1}"+m.TwitterCard+"${2}")
		html = metaRe("twitter:title").ReplaceAllString(html, "${1}"+m.Title+"${2}")
		html = metaRe("twitter:description").ReplaceAllString(html, "${1}"+m.Description+"${2}")
		if m.OGImage != "" {
			img := m.OGImage
			if !strings.HasPrefix(img, "http") {
				img = "https://logikraf.id" + img
			}
			html = metaRe("twitter:image").ReplaceAllString(html, "${1}"+img+"${2}")
		}
	}
	// JSON-LD schemas
	if m != nil && m.Schema != "" {
		inject := "\n    <script type=\"application/ld+json\">" + m.Schema + "</script>"
		html = strings.Replace(html, "</head>", inject+"\n</head>", 1)
	}
	if m != nil && m.Breadcrumb != "" {
		inject := "\n    <script type=\"application/ld+json\">" + m.Breadcrumb + "</script>"
		html = strings.Replace(html, "</head>", inject+"\n</head>", 1)
	}
	// Default og:image bila tidak diset tiap route — pastikan shareable
	if !strings.Contains(html, "og:image") && !strings.Contains(html, "og:image:...") {
		html = strings.Replace(html, "</head>", `    <meta property="og:image" content="https://logikraf.id/og-image.png" />
</head>`, 1)
	}
	// Content-Type WAJIB text/html — tanpa ini Fiber kirim text/plain dan
	// crawler memperlakukan halaman sebagai teks biasa (regresi 20 Sep).
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
	return &pageMeta{Title: title, Description: excerpt, OGImage: ogImage, OGType: "article", OGLocale: "id_ID", OGSiteName: "Logika Kreatif Indonesia", TwitterCard: "summary_large_image", Schema: schema}
}

// portfolioMeta — meta unik per studi kasus portfolio (pola sama dengan blogMeta).
// Sebelumnya /portfolio/:slug jatuh ke meta homepage sehingga judulnya kembar.
func portfolioMeta(slug string) *pageMeta {
	var title, excerpt, client, img, upd string
	err := model.DB.Raw(
		"SELECT title, COALESCE(excerpt, LEFT(description, 155), ''), COALESCE(client_name, ''), COALESCE(thumbnail, ''), DATE_FORMAT(COALESCE(updated_at, created_at), '%Y-%m-%dT%H:%i:%sZ') FROM portfolios WHERE slug=? AND is_published=1 AND deleted_at IS NULL",
		slug,
	).Row().Scan(&title, &excerpt, &client, &img, &upd)
	if err != nil || title == "" {
		return nil
	}
	if suffix := " | Logika Kreatif Indonesia"; len(title)+len(suffix) <= 65 {
		title += suffix
	}
	excerpt = strings.ReplaceAll(excerpt, "\n", " ")
	excerpt = strings.NewReplacer("<", "", ">", "").Replace(excerpt)
	if len(excerpt) > 160 {
		excerpt = excerpt[:157] + "..."
	}
	creator := client
	if creator == "" {
		creator = "Logika Kreatif Indonesia"
	}
	schema := fmt.Sprintf(
		`{"@context":"https://***@type":"CreativeWork","name":"%s","description":"%s","dateModified":"%s","creator":{"@type":"Organization","name":"%s"},"url":"https://logikraf.id/portfolio/%s"}`,
		escHTML(title), escHTML(excerpt), upd, escHTML(creator), escHTML(slug),
	)
	return &pageMeta{Title: title, Description: excerpt, OGImage: img, OGType: "article", OGLocale: "id_ID", OGSiteName: "Logika Kreatif Indonesia", TwitterCard: "summary_large_image", Schema: schema}
}

// serveSPA — sajikan SPA dengan canonical self-referential + meta unik per route statis.
func serveSPA(c fiber.Ctx, frontendDir string) error {
	return serveSPAWithMeta(c, frontendDir, staticMeta(c.Path()))
}

// staticMeta — meta unik per route statis. Sebelumnya semua route memakai meta
// homepage yang sama, jadi URL di sitemap tampil nyaris kembar di mata Google.
func staticMeta(path string) *pageMeta {
	p := path
	if p == "" {
		p = "/"
	}
	if len(p) > 1 {
		p = strings.TrimSuffix(p, "/")
	}
	m, ok := staticMetaMap[p]
	if !ok {
		return nil
	}
	mm := m
	return &mm
}

var staticMetaMap = map[string]pageMeta{
	"/": {
		Title:       "Logikraf.id | Pembuatan Website & Sistem Digital untuk UMKM Bekasi",
		Description: "PT Logika Kreatif Indonesia (Bekasi) menyediakan solusi digital untuk UMKM: pembuatan website, toko online, sistem kasir/POS, manajemen stok, dan buku kas berbasis web.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
		Schema:      `{"@context":"https://schema.org","@type":"WebSite","name":"Logika Kreatif Indonesia","url":"https://logikraf.id","potentialAction":{"@type":"SearchAction","target":"https://logikraf.id/?q={search_term_string}","query-input":"required name=search_term_string"}}`,
	},
	"/layanan": {
		Title:       "Layanan: Software, Website, UI/UX & Digital Marketing | Logika Kreatif Indonesia",
		Description: "Layanan pembuatan website, aplikasi web, UI/UX, branding, dan sistem kasir digital untuk UMKM Bekasi & Jakarta.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/paket": {
		Title:       "Paket & Harga Jasa Website dan Software | Logika Kreatif Indonesia",
		Description: "Pilih paket pembuatan website, aplikasi, dan digital marketing sesuai kebutuhan serta anggaran bisnis Anda.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/blog": {
		Title:       "Blog: Tips Web, SEO & Digital Marketing | Logika Kreatif Indonesia",
		Description: "Artikel praktis seputar pembuatan website, SEO, keamanan, UI/UX, dan digital marketing untuk bisnis Indonesia.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/portfolio": {
		Title:       "Portofolio & Studi Kasus | Logika Kreatif Indonesia",
		Description: "Kumpulan studi kasus proyek digital Logikraf: platform manajemen perumahan, sistem internal, dan website bisnis untuk klien UMKM hingga perusahaan.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/tentang-kami": {
		Title:       "Tentang Kami | PT Logika Kreatif Indonesia",
		Description: "Kenali tim di balik Logika Kreatif Indonesia: software house dan agensi digital yang membangun produk untuk bisnis Indonesia.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/kontak": {
		Title:       "Kontak & Konsultasi Proyek Digital | Logika Kreatif Indonesia",
		Description: "Hubungi kami (Bekasi) untuk konsultasi GRATIS pembuatan website UMKM, sistem POS, atau digitalisasi bisnis Anda.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/kebijakan-privasi": {
		Title:       "Kebijakan Privasi | Logika Kreatif Indonesia",
		Description: "Bagaimana Logika Kreatif Indonesia mengumpulkan, memakai, dan melindungi data pribadi pengguna.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/syarat-ketentuan": {
		Title:       "Syarat & Ketentuan Layanan | Logika Kreatif Indonesia",
		Description: "Syarat dan ketentuan penggunaan layanan serta produk Logika Kreatif Indonesia.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
}
