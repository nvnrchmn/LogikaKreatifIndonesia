package handler

import (
	"encoding/json"
	"fmt"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func TestAdminClientFiles(t *testing.T) {
	tmp := t.TempDir()
	os.Setenv("UPLOAD_ROOT", tmp)
	defer os.Unsetenv("UPLOAD_ROOT")

	cl := model.Client{CompanyName: "PT Uji Berkas", PICName: "Nova"}
	if err := model.DB.Create(&cl).Error; err != nil {
		t.Fatalf("gagal buat klien uji: %v", err)
	}
	dir := filepath.Join(tmp, "client", fmt.Sprint(cl.ID))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	for _, n := range []string{"o7-1700000000000000000-logo-baru.png", "1700000000000000001-materi briefing.pdf"} {
		if err := os.WriteFile(filepath.Join(dir, n), []byte("x"), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	app := fiber.New()
	app.Get("/f", AdminClientFiles)
	app.Get("/d/:client_id/:name", AdminDownloadClientFile)

	res, err := app.Test(httptest.NewRequest("GET", "/f", nil))
	if err != nil {
		t.Fatal(err)
	}
	var out struct {
		Clients []struct {
			ClientID uint   `json:"client_id"`
			Company  string `json:"company"`
			Count    int    `json:"count"`
			Files    []struct {
				Label   string `json:"label"`
				OrderID string `json:"order_id"`
			} `json:"files"`
		} `json:"clients"`
		Total int `json:"total"`
	}
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatalf("respons bukan JSON: %v", err)
	}
	if out.Total != 2 {
		t.Fatalf("total = %d, ingin 2", out.Total)
	}
	if len(out.Clients) != 1 || out.Clients[0].Company != "PT Uji Berkas" || out.Clients[0].Count != 2 {
		t.Fatalf("bucket klien salah: %+v", out.Clients)
	}
	labels := map[string]string{}
	for _, f := range out.Clients[0].Files {
		labels[f.Label] = f.OrderID
	}
	if oid, ok := labels["logo-baru.png"]; !ok || oid != "7" {
		t.Fatalf("nama cantik/order id salah: %v", labels)
	}
	if _, ok := labels["materi briefing.pdf"]; !ok {
		t.Fatalf("prefiks timestamp tidak terpotong: %v", labels)
	}

	// unduh berkas yang ada
	res2, err := app.Test(httptest.NewRequest("GET", "/d/"+fmt.Sprint(cl.ID)+"/o7-1700000000000000000-logo-baru.png", nil))
	if err != nil {
		t.Fatal(err)
	}
	if res2.StatusCode != 200 {
		t.Fatalf("unduh berkas sah = %d, ingin 200", res2.StatusCode)
	}

	// percobaan keluar folder (path traversal) harus gagal
	res3, _ := app.Test(httptest.NewRequest("GET", "/d/"+fmt.Sprint(cl.ID)+"/..%2F..%2Fetc%2Fpasswd", nil))
	if res3.StatusCode == 200 {
		t.Fatalf("path traversal DITERIMA (status %d) — bahaya", res3.StatusCode)
	}
}
