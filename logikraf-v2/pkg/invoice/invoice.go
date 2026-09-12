// Package invoice membuat dokumen invoice/tagihan PDF berkop Logikraf.
// Sengaja hanya memakai font inti (Helvetica) dan tanpa gambar supaya tidak
// bergantung pada path file/cwd saat dijalankan systemd.
package invoice

import (
	"bytes"
	"strconv"
	"strings"
	"time"

	"github.com/go-pdf/fpdf"
)

// Item — satu baris tagihan.
type Item struct {
	Desc   string
	Amount uint
}

// Data — isi invoice.
type Data struct {
	Number      string
	Status      string
	IssueDate   time.Time
	DueDate     *time.Time
	ClientName  string
	Company     string
	Email       string
	Phone       string
	Address     string
	Items       []Item
	Total       uint
	Paid        uint
	Outstanding uint
	// PaidAt — tanggal invoice benar-benar lunas. Bila terisi (dan Paid >= Total),
	// baris "Jatuh tempo" diganti "Lunas pada <tanggal>": jatuh tempo sudah tidak
	// relevan begitu uangnya diterima, sementara tanggal bayar berguna untuk arsip klien.
	PaidAt *time.Time
	// NIB/NPWP penerbit — kosong berarti barisnya tidak dicetak sama sekali.
	NIB  string
	NPWP string
	Notes string
}

// rp — 1499000 → "1.499.000"
func rp(n uint) string {
	s := strconv.FormatUint(uint64(n), 10)
	var out []byte
	for i := 0; i < len(s); i++ {
		if i > 0 && (len(s)-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, s[i])
	}
	return string(out)
}

func tanggal(t time.Time) string { return t.Format("02 Jan 2006") }

// legalLine — baris NIB/NPWP untuk blok penerbit. Mengembalikan "" bila keduanya
// belum diisi (invoice lama / data belum lengkap) supaya tidak ada baris kosong.
func legalLine(nib, npwp string) string {
	var parts []string
	if v := strings.TrimSpace(nib); v != "" {
		parts = append(parts, "NIB "+v)
	}
	if v := strings.TrimSpace(npwp); v != "" {
		parts = append(parts, "NPWP "+v)
	}
	return strings.Join(parts, "  |  ")
}

func statusText(s string) string {
	switch s {
	case "paid", "settled":
		return "LUNAS"
	case "pending":
		return "MENUNGGU PEMBAYARAN"
	case "overdue":
		return "TERLAMBAT"
	case "draft":
		return "DRAF"
	}
	if s == "" {
		return "-"
	}
	return strings.ToUpper(s)
}

// Build — susun PDF invoice A4, mengembalikan byte siap dilampirkan ke email.
func Build(d Data) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 20)
	pdf.AddPage()

	// Bar aksen warna brand (LKI #0052FF).
	pdf.SetFillColor(0, 82, 255)
	pdf.Rect(0, 0, 210, 4, "F")

	// Kop: logo lockup (ikon LK + wordmark "Logikraf" bergaris luar) di kiri.
	if logoExists() {
		pdf.ImageOptions(logoPath(), 15, 13, 46, 0, false, fpdf.ImageOptions{ImageType: "PNG"}, 0, "")
	} else {
		// Fallback teks bila berkas logo tidak tersedia.
		pdf.SetTextColor(15, 23, 42)
		pdf.SetFont("Helvetica", "B", 20)
		pdf.SetXY(15, 16)
		pdf.CellFormat(90, 9, "LOGIKRAF", "", 0, "L", false, 0, "")
	}
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(15, 27)
	pdf.CellFormat(100, 5, "logikraf.id  |  support@logikraf.id", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetTextColor(15, 23, 42)
	pdf.SetXY(105, 16)
	pdf.CellFormat(90, 9, "INVOICE", "", 0, "R", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(105, 26)
	pdf.CellFormat(90, 5, d.Number, "", 0, "R", false, 0, "")

	// Garis pemisah + kepala dua kolom.
	pdf.SetDrawColor(203, 213, 225)
	pdf.SetLineWidth(0.4)
	pdf.Line(15, 34, 195, 34)
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(15, 38)
	pdf.CellFormat(90, 5, "DITAGIHKAN KEPADA", "", 0, "L", false, 0, "")
	pdf.SetXY(105, 38)
	pdf.CellFormat(90, 5, "DETAIL TAGIHAN", "", 0, "R", false, 0, "")

	// Blok klien.
	pdf.SetTextColor(15, 23, 42)
	pdf.SetFont("Helvetica", "B", 11)
	nm := strings.TrimSpace(d.Company)
	if nm == "" {
		nm = strings.TrimSpace(d.ClientName)
	}
	if nm == "" {
		nm = "-"
	}
	pdf.SetXY(15, 44)
	pdf.CellFormat(88, 5, nm, "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 9)
	y := 50.0
	for _, line := range []string{d.ClientName, d.Email, d.Phone, d.Address} {
		if strings.TrimSpace(line) == "" {
			continue
		}
		pdf.SetXY(15, y)
		pdf.CellFormat(88, 4.6, line, "", 0, "L", false, 0, "")
		y += 5
	}

	// Meta kanan.
	meta := [][2]string{{"Tanggal", tanggal(d.IssueDate)}, {"Jatuh tempo", "-"}, {"Status", statusText(d.Status)}}
	if d.DueDate != nil {
		meta[1][1] = tanggal(*d.DueDate)
	}
	// Invoice lunas: tampilkan kapan dibayar, bukan jatuh tempo yang sudah lewat.
	if d.PaidAt != nil && d.Total > 0 && d.Paid >= d.Total {
		meta[1][0] = "Lunas pada"
		meta[1][1] = tanggal(*d.PaidAt)
	}
	my := 44.0
	for _, m := range meta {
		pdf.SetFont("Helvetica", "", 9)
		pdf.SetTextColor(100, 116, 139)
		pdf.SetXY(105, my)
		pdf.CellFormat(40, 5, m[0], "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "B", 9)
		pdf.SetTextColor(15, 23, 42)
		pdf.SetXY(145, my)
		pdf.CellFormat(50, 5, m[1], "", 0, "R", false, 0, "")
		my += 6
	}

	// Tabel item (fill eksplisit: default hitam membuat teks tak terlihat).
	ty := 70.0
	if y > 64 {
		ty = y + 4
	}
	pdf.SetFillColor(226, 232, 240)
	pdf.SetTextColor(15, 23, 42)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetXY(15, ty)
	pdf.CellFormat(10, 8, "NO", "", 0, "C", true, 0, "")
	pdf.CellFormat(135, 8, "DESKRIPSI", "", 0, "L", true, 0, "")
	pdf.CellFormat(35, 8, "JUMLAH", "", 0, "R", true, 0, "")
	ry := ty + 8
	pdf.SetFont("Helvetica", "", 9)
	for i, it := range d.Items {
		desc := it.Desc
		if len(desc) > 70 {
			desc = desc[:70]
		}
		pdf.SetXY(15, ry)
		pdf.CellFormat(10, 8, strconv.Itoa(i+1), "", 0, "C", false, 0, "")
		pdf.SetXY(25, ry)
		pdf.CellFormat(135, 8, desc, "", 0, "L", false, 0, "")
		pdf.SetXY(160, ry)
		pdf.CellFormat(35, 8, "Rp "+rp(it.Amount), "", 0, "R", false, 0, "")
		ry += 8
	}

	// Ringkasan (baris terakhir ditebalkan = jumlah yang harus dibayar).
	rows := [][2]string{{"Total", "Rp " + rp(d.Total)}}
	if d.Paid > 0 {
		rows = append(rows, [2]string{"Sudah dibayar", "Rp " + rp(d.Paid)})
	}
	if d.Outstanding > 0 {
		rows = append(rows, [2]string{"Sisa tagihan", "Rp " + rp(d.Outstanding)})
	}
	sy := ry + 2
	for i, r := range rows {
		style := ""
		if i == len(rows)-1 {
			style = "B"
		}
		pdf.SetFont("Helvetica", style, 10)
		pdf.SetXY(120, sy)
		pdf.CellFormat(40, 6, r[0], "", 0, "L", false, 0, "")
		pdf.SetXY(160, sy)
		pdf.CellFormat(35, 6, r[1], "", 0, "R", false, 0, "")
		sy += 6
	}

	// Terbilang — jumlah dalam huruf (lazim pada invoice Indonesia).
	pdf.SetFont("Helvetica", "I", 9)
	pdf.SetTextColor(51, 65, 85)
	pdf.SetXY(15, sy+1)
	pdf.CellFormat(180, 5, "Terbilang: "+Terbilang(d.Total), "", 0, "L", false, 0, "")

	// Catatan & cara bayar.
	pdf.SetDrawColor(203, 213, 225)
	pdf.Line(15, sy+8, 195, sy+8)
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(51, 65, 85)
	pdf.SetXY(15, sy+12)
	pdf.MultiCell(180, 4.8,
		"Pembayaran via transfer bank atau QRIS. Mohon cantumkan nomor invoice pada berita transfer. "+
			"Status dokumen ini: "+statusText(d.Status)+".", "", "L", false)
	// Catatan standar bila pemanggil tidak mengirim catatan khusus.
	note := strings.TrimSpace(d.Notes)
	if note == "" {
		note = "Terima kasih telah bekerja sama dengan Logikraf."
	}
	pdf.SetX(15)
	pdf.MultiCell(180, 4.8, "Catatan: "+note, "", "L", false)
	// Blok penerbit mengikuti akhir isi supaya halaman tidak menyisakan ruang kosong besar.
	issuer := "Penerbit:\n" + IssuerName + " (" + IssuerForm + ")\n" + IssuerAddress + "\n" +
		IssuerEmail + "  |  " + IssuerPhone
	legal := legalLine(d.NIB, d.NPWP)
	if legal != "" {
		issuer += "\n" + legal
	}
	py := pdf.GetY() + 10
	// Baris NIB/NPWP menambah satu baris: batas atas diturunkan agar tidak menabrak footer.
	maxPy := 250.0
	if legal != "" {
		maxPy = 244
	}
	if py > maxPy {
		py = maxPy
	}
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(15, py)
	pdf.MultiCell(90, 4.2, issuer, "", "L", false)

	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(15, 268)
	pdf.CellFormat(180, 5, "Dokumen ini diterbitkan otomatis dan sah tanpa tanda tangan basah  -  logikraf.id", "", 0, "C", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
