package handler

import (
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

type adminFileRow struct {
	Name    string `json:"name"`
	Label   string `json:"label"`
	Size    int64  `json:"size"`
	OrderID string `json:"order_id"`
	At      string `json:"at"`
}

type adminClientBucket struct {
	ClientID uint           `json:"client_id"`
	Company  string         `json:"company"`
	PIC      string         `json:"pic"`
	Phone    string         `json:"phone"`
	Count    int            `json:"count"`
	Files    []adminFileRow `json:"files"`
}

// AdminClientFiles — daftar berkas yang dikirim klien lewat portal (panel admin).
func AdminClientFiles(c fiber.Ctx) error {
	base := filepath.Join(uploadRoot(), "client")
	ents, err := os.ReadDir(base)
	if err != nil {
		return c.JSON(fiber.Map{"clients": []any{}, "total": 0})
	}
	filterID, _ := strconv.Atoi(strings.TrimSpace(c.Query("client_id")))
	q := strings.ToLower(strings.TrimSpace(c.Query("q")))

	var clients []model.Client
	model.DB.Find(&clients)
	byID := map[uint]model.Client{}
	for _, cl := range clients {
		byID[cl.ID] = cl
	}

	out := []adminClientBucket{}
	total := 0
	for _, e := range ents {
		if !e.IsDir() {
			continue
		}
		cid, err := strconv.Atoi(e.Name())
		if err != nil || (filterID != 0 && cid != filterID) {
			continue
		}
		cl := byID[uint(cid)]
		company := cl.CompanyName
		if company == "" {
			company = "(klien " + e.Name() + ")"
		}
		b := adminClientBucket{ClientID: uint(cid), Company: company, PIC: cl.PICName, Phone: cl.Phone}
		files, err := os.ReadDir(filepath.Join(base, e.Name()))
		if err != nil {
			continue
		}
		for _, f := range files {
			if f.IsDir() {
				continue
			}
			info, err := f.Info()
			if err != nil {
				continue
			}
			label := prettyUploadName(f.Name())
			if q != "" && !strings.Contains(strings.ToLower(label+" "+company), q) {
				continue
			}
			b.Files = append(b.Files, adminFileRow{
				Name:    f.Name(),
				Label:   label,
				Size:    info.Size(),
				OrderID: uploadOrderID(f.Name()),
				At:      info.ModTime().Format("2006-01-02 15:04"),
			})
			total++
		}
		if len(b.Files) == 0 {
			continue
		}
		sort.Slice(b.Files, func(i, j int) bool { return b.Files[i].At > b.Files[j].At })
		b.Count = len(b.Files)
		out = append(out, b)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Count > out[j].Count })
	return c.JSON(fiber.Map{"clients": out, "total": total})
}

// AdminDownloadClientFile — admin mengunduh berkas milik klien mana pun.
func AdminDownloadClientFile(c fiber.Ctx) error {
	cid, err := strconv.Atoi(strings.TrimSpace(c.Params("client_id")))
	if err != nil || cid <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "client_id tidak valid"})
	}
	name := safeFileName(c.Params("name"))
	p := filepath.Join(uploadRoot(), "client", strconv.Itoa(cid), name)
	if _, err := os.Stat(p); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "berkas tidak ditemukan"})
	}
	c.Set("Content-Disposition", "attachment; filename=\""+prettyUploadName(name)+"\"")
	return c.SendFile(p)
}
