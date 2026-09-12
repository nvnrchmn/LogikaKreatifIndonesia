package handler

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// clientAllowedExt — jenis berkas yang boleh diunggah klien (aset & dokumen proyek).
var clientAllowedExt = map[string]bool{
	".png": true, ".jpg": true, ".jpeg": true, ".webp": true, ".gif": true, ".svg": true,
	".pdf": true, ".docx": true, ".xlsx": true, ".pptx": true, ".txt": true, ".csv": true,
	".zip": true, ".rar": true, ".ai": true, ".psd": true, ".mp4": true, ".mov": true,
}

// uploadRoot — basis folder unggahan (bisa dioverride lewat env UPLOAD_ROOT).
func uploadRoot() string {
	if r := strings.TrimSpace(os.Getenv("UPLOAD_ROOT")); r != "" {
		return r
	}
	return "/www/wwwroot/logikraf.id/uploads"
}

func clientUploadDir(cid uint) string {
	return filepath.Join(uploadRoot(), "client", fmt.Sprintf("%d", cid))
}

// safeFileName — bersihkan nama berkas dari klien (anti path traversal).
func safeFileName(n string) string {
	n = filepath.Base(strings.ReplaceAll(n, "\\", "/"))
	var b strings.Builder
	for _, r := range n {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '.' || r == '-' || r == '_' || r >= 0x80:
			b.WriteRune(r)
		case r == ' ':
			b.WriteRune('-')
		}
	}
	s := strings.Trim(b.String(), "-.")
	if len(s) > 80 {
		s = s[:80]
	}
	if s == "" || s == "." || s == ".." {
		s = "berkas"
	}
	return s
}

// UploadClientFile — klien mengunggah berkas (logo, materi, dokumen) ke portal.
func UploadClientFile(c fiber.Ctx) error {
	cid, cl, err := clientIDForUser(c)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "akun belum tertaut ke data klien"})
	}
	fh, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "berkas belum dipilih"})
	}
	if fh.Size > 15<<20 {
		return c.Status(400).JSON(fiber.Map{"error": "ukuran berkas maksimal 15 MB"})
	}
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	if !clientAllowedExt[ext] {
		return c.Status(400).JSON(fiber.Map{"error": "jenis berkas tidak diizinkan"})
	}
	orderID := strings.TrimSpace(c.FormValue("order_id"))
	if orderID != "" {
		var n int64
		model.DB.Model(&model.Order{}).Where("id = ? AND client_id = ?", orderID, cid).Count(&n)
		if n == 0 {
			return c.Status(403).JSON(fiber.Map{"error": "pesanan bukan milik akun Anda"})
		}
	}
	name := fmt.Sprintf("%d-%s", time.Now().UnixNano(), safeFileName(fh.Filename))
	if orderID != "" {
		name = "o" + orderID + "-" + name
	}
	dir := clientUploadDir(cid)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyiapkan folder"})
	}
	if err := c.SaveFile(fh, filepath.Join(dir, name)); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan berkas"})
	}
	note := strings.TrimSpace(c.FormValue("note"))
	go notifyClientFileUploaded(cl, fh.Filename, note)
	return c.Status(201).JSON(fiber.Map{"ok": true, "file": name, "size": fh.Size})
}

// ClientFiles — daftar berkas yang pernah diunggah klien ini.
func ClientFiles(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "akun belum tertaut ke data klien"})
	}
	ents, err := os.ReadDir(clientUploadDir(cid))
	if err != nil {
		return c.JSON(fiber.Map{"files": []any{}})
	}
	type fileRow struct {
		Name    string `json:"name"`
		Size    int64  `json:"size"`
		OrderID string `json:"order_id"`
		At      string `json:"at"`
	}
	rows := make([]fileRow, 0, len(ents))
	for _, e := range ents {
		if e.IsDir() {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		n := e.Name()
		oid := ""
		if strings.HasPrefix(n, "o") {
			if i := strings.Index(n, "-"); i > 1 {
				oid = n[1:i]
			}
		}
		rows = append(rows, fileRow{Name: n, Size: info.Size(), OrderID: oid, At: info.ModTime().Format("2006-01-02 15:04")})
	}
	sort.Slice(rows, func(i, j int) bool { return rows[i].At > rows[j].At })
	return c.JSON(fiber.Map{"files": rows})
}

// DownloadClientFile — klien mengunduh berkas miliknya sendiri.
func DownloadClientFile(c fiber.Ctx) error {
	cid, _, err := clientIDForUser(c)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "akun belum tertaut ke data klien"})
	}
	name := safeFileName(c.Params("name"))
	p := filepath.Join(clientUploadDir(cid), name)
	if info, err := os.Stat(p); err != nil || info.IsDir() {
		return c.Status(404).JSON(fiber.Map{"error": "berkas tidak ditemukan"})
	}
	c.Set("Content-Disposition", "attachment; filename=\""+name+"\"")
	return c.SendFile(p)
}
