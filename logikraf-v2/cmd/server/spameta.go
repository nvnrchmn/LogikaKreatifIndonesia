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
		`{"@context":"https://schema.org","@type":"CreativeWork","name":"%s","description":"%s","dateModified":"%s","creator":{"@type":"Organization","name":"%s"},"url":"https://logikraf.id/portfolio/%s"}`,
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
	"/faq": {
		Title:       "FAQ: Pertanyaan Umum Jasa Website & Sistem Digital | Logika Kreatif Indonesia",
		Description: "Panduan pembayaran logikraf.id: cara memindai QRIS, verifikasi otomatis, status pembayaran, sampai kebijakan refund paket website dan aplikasi.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/kebijakan-refund": {
		Title:       "Kebijakan Refund | Logika Kreatif Indonesia",
		Description: "Ketentuan pengembalian dana (refund) untuk layanan pembuatan website dan sistem digital Logikraf, termasuk syarat dan alur pengajuannya.",
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/paket": {
		Title:       "Harga & Biaya Pembuatan Website Perusahaan | Logikraf",
		Description: "Rincian biaya pembuatan website: Starter Rp 1.499.000, Business Rp 2.499.000, Commerce Rp 5.999.000 - termasuk hosting, SSL, dan SEO dasar.",
		Schema:      `{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Berapa biaya pembuatan website di Logikraf?", "acceptedAnswer": {"@type": "Answer", "text": "Mulai Rp 1.499.000 (Starter), Rp 2.499.000 (Business), dan Rp 5.999.000 (Commerce). Nominal ini adalah harga tetap pada invoice digital Anda."}}, {"@type": "Question", "name": "Apa saja yang sudah termasuk dalam biaya paket?", "acceptedAnswer": {"@type": "Answer", "text": "Hosting, SSL, tampilan mobile responsive, dan SEO dasar. Paket Business menambah katalog produk, blog, dashboard admin, dan manajemen lead."}}, {"@type": "Question", "name": "Apakah ada biaya tersembunyi?", "acceptedAnswer": {"@type": "Answer", "text": "Tidak ada. Total yang dibayar sama persis dengan nominal pada invoice digital Anda."}}, {"@type": "Question", "name": "Bagaimana cara pembayaran biaya paket?", "acceptedAnswer": {"@type": "Answer", "text": "Online lewat QRIS yang diproses gerbang pembayaran berlisensi PJP Bank Indonesia, dipindai dari m-Banking maupun e-wallet apa pun."}}, {"@type": "Question", "name": "Paket mana yang cocok untuk toko online?", "acceptedAnswer": {"@type": "Answer", "text": "Logikraf Commerce: katalog produk, checkout, payment gateway, manajemen pesanan, inventori, integrasi pengiriman, dan laporan penjualan."}}]}`,
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
	"/aplikasi-manajemen-perumahan": {
		Title:       "Aplikasi Manajemen Perumahan & RT/RW - SmartHub | Logikraf",
		Description: "Aplikasi manajemen perumahan dan RT/RW: iuran warga via QRIS, buku kas, sensus warga terenkripsi, pengingat tunggakan, dan peminjaman fasilitas.",
		Schema:      `{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Apa itu aplikasi manajemen perumahan SmartHub?", "acceptedAnswer": {"@type": "Answer", "text": "SmartHub adalah platform SaaS tata kelola perumahan buatan Logikraf yang menyatukan pembayaran iuran, buku kas, sensus warga, fasilitas, dan keluhan dalam satu aplikasi untuk pengurus RT/RW beserta warganya."}}, {"@type": "Question", "name": "Bagaimana warga membayar iuran?", "acceptedAnswer": {"@type": "Answer", "text": "Warga membayar iuran melalui QRIS dinamis yang diproses payment gateway berlisensi, dan status pembayaran tercatat otomatis pada kas lingkungan."}}, {"@type": "Question", "name": "Apakah data warga aman?", "acceptedAnswer": {"@type": "Answer", "text": "Data kependudukan disimpan terenkripsi dan aksesnya dibatasi sesuai peran pengguna, sehingga tidak semua orang dapat membukanya."}}, {"@type": "Question", "name": "Bisakah dipakai untuk beberapa perumahan sekaligus?", "acceptedAnswer": {"@type": "Answer", "text": "Bisa. SmartHub dirancang multi-tenant dan multi-role, sehingga satu sistem dapat melayani beberapa lingkungan dengan data yang terpisah."}}, {"@type": "Question", "name": "Apakah Logikraf membangun aplikasi serupa untuk kebutuhan khusus?", "acceptedAnswer": {"@type": "Answer", "text": "Ya. SmartHub adalah contoh yang sudah berjalan; kami juga membangun aplikasi web custom lain sesuai proses bisnis Anda."}}]}`,
		OGType:      "website",
		OGLocale:    "id_ID",
		OGSiteName:  "Logika Kreatif Indonesia",
		TwitterCard: "summary_large_image",
	},
	"/jasa-pembuatan-aplikasi-web": {
		Title:       "Jasa Pembuatan Aplikasi Web & Sistem Informasi | Logikraf",
		Description: "Jasa bikin aplikasi web custom: kasir/POS, inventory, penjualan online, sampai sistem informasi internal. Mulai Rp 1.499.000, garansi pengerjaan.",
		Schema:      `{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Apa bedanya aplikasi web custom dengan software jadi?", "acceptedAnswer": {"@type": "Answer", "text": "Aplikasi custom dibangun mengikuti alur kerja Anda, sehingga fitur yang ada benar-benar dipakai. Software jadi menuntut Anda menyesuaikan cara kerja dengan template-nya."}}, {"@type": "Question", "name": "Apakah kode sumber dan dokumentasinya menjadi milik saya?", "acceptedAnswer": {"@type": "Answer", "text": "Ya. Anda menerima akses penuh atas kode dan dokumentasi proyek yang kami bangun."}}, {"@type": "Question", "name": "Apakah aplikasi bisa dibuka dari ponsel?", "acceptedAnswer": {"@type": "Answer", "text": "Bisa. Aplikasi dibangun sebagai web app yang diakses lewat browser di desktop maupun ponsel, tanpa perlu instalasi tambahan."}}, {"@type": "Question", "name": "Berapa biaya dan bagaimana cara pembayarannya?", "acceptedAnswer": {"@type": "Answer", "text": "Biaya paket mulai Rp 1.499.000 dan dibayar online melalui QRIS. Rincian tiap paket ada di halaman Paket & Harga."}}, {"@type": "Question", "name": "Apakah ada pendampingan setelah aplikasi rilis?", "acceptedAnswer": {"@type": "Answer", "text": "Ada. Kendala teknis setelah rilis diperbaiki gratis selama masa garansi aktif, dan kami mendampingi sisi server serta DevOps."}}]}`,
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
