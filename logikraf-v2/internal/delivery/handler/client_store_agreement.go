package handler

import (
	"bytes"
	"crypto/sha256"
	_ "embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/go-pdf/fpdf"
	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// Perjanjian layanan (clickwrap) untuk verifikasi KYC tenant. Teks disimpan
// berversi di repo agar hash-nya stabil dan dapat dibuktikan.
//
//go:embed agreement_v1.md
var agreementTextV1 string

const agreementVersion = "v1"

func agreementHash(text string) string {
	sum := sha256.Sum256([]byte(text))
	return hex.EncodeToString(sum[:])
}

func currentAgreement() (version, text, hash string) {
	return agreementVersion, agreementTextV1, agreementHash(agreementTextV1)
}

// GetClientStoreAgreement — GET /api/client-store/agreement
// Client store menampilkan naskah ini di UI sebelum tenant memberi persetujuan.
func GetClientStoreAgreement(c fiber.Ctx) error {
	if _, ok := resolveClientStore(c); !ok {
		return clientStoreAuthError(c)
	}
	version, text, hash := currentAgreement()
	return c.JSON(fiber.Map{"version": version, "text": text, "hash": hash})
}

// kycConsentInput — bukti persetujuan elektronik (clickwrap) dari client store.
type kycConsentInput struct {
	Version    string `json:"version"`
	Hash       string `json:"hash"`
	AgreedAt   string `json:"agreed_at"`
	IP         string `json:"ip"`
	UserAgent  string `json:"user_agent"`
	LogID      string `json:"log_id"`
	SignerName string `json:"signer_name"`
}

func validateConsent(consent kycConsentInput) error {
	version, _, hash := currentAgreement()
	if strings.TrimSpace(consent.Version) != version {
		return fmt.Errorf("versi perjanjian tidak cocok")
	}
	if !strings.EqualFold(strings.TrimSpace(consent.Hash), hash) {
		return fmt.Errorf("hash naskah perjanjian tidak cocok")
	}
	if strings.TrimSpace(consent.LogID) == "" || strings.TrimSpace(consent.AgreedAt) == "" || strings.TrimSpace(consent.SignerName) == "" {
		return fmt.Errorf("data persetujuan tidak lengkap")
	}
	return nil
}

// latin1Safe — fpdf core font hanya mendukung Latin-1; ganti karakter lain.
func latin1Safe(s string) string {
	var b strings.Builder
	for _, r := range s {
		switch {
		case r == '\n' || r == '\t' || (r >= 32 && r < 127):
			b.WriteRune(r)
		case r >= 160 && r <= 255:
			b.WriteRune(r)
		case r == '\u2013' || r == '\u2014':
			b.WriteRune('-')
		case r == '\u2018' || r == '\u2019':
			b.WriteRune('\'')
		case r == '\u201c' || r == '\u201d':
			b.WriteRune('"')
		default:
			b.WriteRune('?')
		}
	}
	return b.String()
}

// renderServiceAgreementPDF — bukti persetujuan: identitas + jejak elektronik + naskah.
func renderServiceAgreementPDF(identity map[string]string, consent kycConsentInput) ([]byte, error) {
	_, text, _ := currentAgreement()

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 15)
	pdf.AddPage()

	pdf.SetFont("Helvetica", "B", 13)
	pdf.MultiCell(0, 7, "PERJANJIAN LAYANAN DAN PERSETUJUAN VERIFIKASI DATA", "", "C", false)
	pdf.SetFont("Helvetica", "", 9)
	pdf.MultiCell(0, 5, "Versi: "+latin1Safe(consent.Version)+" | Log ID: "+latin1Safe(consent.LogID), "", "C", false)
	pdf.Ln(4)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(0, 6, "A. Identitas Pendaftar", "", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 9)
	identitas := [][2]string{
		{"Nama/Usaha", identity["legal_name"]},
		{"Email", identity["email"]},
		{"ID Tenant", identity["tenant_ref"]},
		{"Tipe Entitas", identity["entity_type"]},
		{"Sub-Akun", identity["sub_account_id"]},
	}
	for _, r := range identitas {
		pdf.CellFormat(42, 5, latin1Safe(r[0]), "", 0, "L", false, 0, "")
		pdf.MultiCell(0, 5, ": "+latin1Safe(r[1]), "", "L", false)
	}
	pdf.Ln(3)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(0, 6, "B. Jejak Persetujuan Elektronik (Clickwrap)", "", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 9)
	jejak := [][2]string{
		{"Metode", "Clickwrap - centang Setuju pada aplikasi"},
		{"Waktu Persetujuan", consent.AgreedAt},
		{"Nama Penandatangan", consent.SignerName},
		{"Alamat IP", consent.IP},
		{"User-Agent", consent.UserAgent},
		{"Log ID Persetujuan", consent.LogID},
		{"Hash Naskah (SHA-256)", consent.Hash},
	}
	for _, r := range jejak {
		pdf.CellFormat(42, 5, latin1Safe(r[0]), "", 0, "L", false, 0, "")
		pdf.MultiCell(0, 5, ": "+latin1Safe(r[1]), "", "L", false)
	}
	pdf.Ln(3)

	pdf.SetFont("Helvetica", "B", 10)
	pdf.CellFormat(0, 6, "C. Naskah Perjanjian", "", 1, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 9)
	pdf.MultiCell(0, 4.6, latin1Safe(text), "", "L", false)

	pdf.Ln(4)
	pdf.SetFont("Helvetica", "I", 8)
	docHash := agreementHash(text + "|" + consent.LogID + "|" + consent.AgreedAt)
	pdf.MultiCell(0, 4.5, "Dokumen ini digenerate otomatis dan sah sebagai bukti persetujuan elektronik. Hash dokumen: "+docHash, "", "C", false)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// uploadFileToProvider — unggah berkas ke Xendit POST /files atas nama sub-akun.
// Mengembalikan file_id, status HTTP, dan body mentah (untuk pesan error).
func uploadFileToProvider(secret, forUser, filename string, data []byte) (string, int, []byte) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	_ = writer.WriteField("purpose", "KYC_DOCUMENT")
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", 0, nil
	}
	if _, err := part.Write(data); err != nil {
		return "", 0, nil
	}
	_ = writer.Close()

	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/files", &buf)
	if err != nil {
		return "", 0, nil
	}
	req.Header.Set("Authorization", xenditPlatformAuth(secret))
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if forUser != "" {
		req.Header.Set("for-user-id", forUser)
	}
	resp, err := partnerHTTP.Do(req)
	if err != nil {
		return "", 0, nil
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return "", resp.StatusCode, raw
	}
	var out struct {
		ID string `json:"id"`
	}
	_ = json.Unmarshal(raw, &out)
	return out.ID, resp.StatusCode, raw
}

func persistAgreement(storeID uint, sub *model.ClientSubAccount, consent kycConsentInput, fileID string) {
	row := model.KycAgreement{
		StoreID: storeID, TenantRef: sub.TenantRef, SubAccountID: sub.SubAccountID,
		Version: consent.Version, TextHash: consent.Hash, LogID: consent.LogID,
		SignerName: consent.SignerName, IP: consent.IP, UserAgent: consent.UserAgent,
		AgreedAt: consent.AgreedAt, ServiceAgreementFileID: fileID,
	}
	_ = model.DB.Create(&row).Error
}
