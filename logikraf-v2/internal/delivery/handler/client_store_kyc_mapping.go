package handler

import (
	"os"
	"strings"
)

// Mapping payload KYC SmartHub → Xendit POST /account_verification
// (openapi submit-account-verification). Semua field authorized_person_*,
// contact_person_*, stakeholders, service_agreement_document berada DI DALAM
// `kyc_details`; top-level hanya country_of_incorporation, business_entity_type,
// business_industry_code, dan kyc_details.

type kycAddressInput struct {
	Alamat    string `json:"alamat"`
	Kota      string `json:"kota"`
	Provinsi  string `json:"provinsi"`
	KodePos   string `json:"kode_pos"`
	Kecamatan string `json:"kecamatan"`
	Kelurahan string `json:"kelurahan"`
}

type kycDataUsahaInput struct {
	NamaLegal                string `json:"nama_legal"`
	Deskripsi                string `json:"deskripsi"`
	SumberDana               string `json:"sumber_dana"`
	RataRataTransaksiBulanan string `json:"rata_rata_transaksi_bulanan"`
}

type kycFilesInput struct {
	KtpDepan    string `json:"ktp_depan"`
	KtpBelakang string `json:"ktp_belakang"`
	Selfie      string `json:"selfie"`
}

type kycSubmitInput struct {
	LegalName       string            `json:"legal_name"`
	Email           string            `json:"email"`
	KtpNumber       string            `json:"ktp_number"`
	TanggalLahir    string            `json:"tanggal_lahir"`
	JenisKelamin    string            `json:"jenis_kelamin"`
	Kewarganegaraan string            `json:"kewarganegaraan"`
	NoHP            string            `json:"no_hp"`
	EntityType      string            `json:"entity_type"`
	SignerName      string            `json:"signer_name"`
	Alamat          kycAddressInput   `json:"alamat"`
	DataUsaha       kycDataUsahaInput `json:"data_usaha"`
	Files           kycFilesInput     `json:"files"`
}

func mapOf(v any) map[string]any {
	if m, ok := v.(map[string]any); ok {
		return m
	}
	return nil
}

func splitName(full string) (string, string) {
	parts := strings.Fields(strings.TrimSpace(full))
	if len(parts) == 0 {
		return "Pemilik", "RT"
	}
	if len(parts) == 1 {
		return parts[0], parts[0]
	}
	return parts[0], strings.Join(parts[1:], " ")
}

func mapGender(v string) string {
	switch strings.ToUpper(strings.TrimSpace(v)) {
	case "FEMALE", "F", "P", "PEREMPUAN", "WANITA":
		return "FEMALE"
	case "OTHER", "LAINNYA":
		return "OTHER"
	default:
		return "MALE"
	}
}

func mapNationality(v string) string {
	u := strings.ToUpper(strings.TrimSpace(v))
	switch u {
	case "WNI", "INDONESIA", "INDONESIAN", "IDN":
		return "ID"
	case "WNA", "":
		return "ID"
	}
	if len(u) == 2 {
		return u
	}
	return "ID"
}

func mapSourceOfFunds(v string) []string {
	switch strings.ToUpper(strings.TrimSpace(v)) {
	case "INVESTOR_SHAREHOLDER_FUNDING", "INVESTMENT_INCOME", "BUSINESS_LOAN",
		"PERSONAL_FUNDING", "DONATIONS", "GRANTS", "OTHER":
		return []string{strings.ToUpper(strings.TrimSpace(v))}
	case "DONASI":
		return []string{"DONATIONS"}
	case "PRIBADI", "PERSONAL":
		return []string{"PERSONAL_FUNDING"}
	default:
		return []string{"REVENUE"}
	}
}

func kycAddress(a kycAddressInput) map[string]any {
	out := map[string]any{
		"street_line_1": strings.TrimSpace(a.Alamat),
		"city":          strings.TrimSpace(a.Kota),
		"province":      strings.TrimSpace(a.Provinsi),
		"postal_code":   strings.TrimSpace(a.KodePos),
		"country_code":  "ID",
	}
	// district & sub_district wajib untuk ID; pakai kecamatan/kelurahan bila ada,
	// fallback ke kota (best-effort, dapat diperbaiki lewat data yang lebih lengkap).
	district := firstNonEmpty(a.Kecamatan, a.Kota)
	subDistrict := firstNonEmpty(a.Kelurahan, a.Kota)
	if district != "" {
		out["district"] = district
	}
	if subDistrict != "" {
		out["sub_district"] = subDistrict
	}
	return out
}

func fileRef(fileID, name string) map[string]any {
	if strings.TrimSpace(fileID) == "" {
		return nil
	}
	return map[string]any{"file_name": name, "file_id": fileID}
}

func splitMobile(raw string) (string, string) {
	no := strings.TrimSpace(raw)
	if no == "" {
		no = strings.TrimSpace(os.Getenv("XENDIT_KYC_MOBILE_NUMBER"))
	}
	cc := firstNonEmpty(os.Getenv("XENDIT_KYC_MOBILE_COUNTRY_CODE"), "+62")
	no = strings.TrimPrefix(no, cc)
	no = strings.TrimPrefix(no, "0")
	return cc, no
}

// buildAccountVerification menyusun body account_verification Xendit dari input
// SmartHub + file dokumen yang sudah diunggah + service agreement.
func buildAccountVerification(in kycSubmitInput, serviceAgreementFileID string) map[string]any {
	first, last := splitName(in.SignerName)
	nationality := mapNationality(in.Kewarganegaraan)
	addr := kycAddress(in.Alamat)
	ident := []any{map[string]any{
		"type":           "ID_NATIONAL_ID_KTP",
		"number":         strings.TrimSpace(in.KtpNumber),
		"document_front": fileRef(in.Files.KtpDepan, "ktp-depan.jpg"),
		"document_back":  fileRef(in.Files.KtpBelakang, "ktp-belakang.jpg"),
	}}
	selfie := fileRef(in.Files.Selfie, "selfie.jpg")

	details := map[string]any{
		"business_legal_name":                   firstNonEmpty(in.DataUsaha.NamaLegal, in.LegalName),
		"business_description":                  firstNonEmpty(in.DataUsaha.Deskripsi, "Pengelolaan iuran warga"),
		"business_intents":                      []string{"PAYMENTS"},
		"business_source_of_funds":              mapSourceOfFunds(in.DataUsaha.SumberDana),
		"business_address":                      addr,
		"legal_entity_address":                  addr,
		"authorized_person_first_name":          first,
		"authorized_person_last_name":           last,
		"authorized_person_gender":              mapGender(in.JenisKelamin),
		"authorized_person_nationality":         nationality,
		"authorized_person_date_of_birth":       in.TanggalLahir,
		"authorized_person_role":                firstNonEmpty(os.Getenv("XENDIT_KYC_ROLE"), "BUSINESS_OWNER"),
		"authorized_person_email_address":       in.Email,
		"authorized_person_address":             addr,
		"authorized_person_selfie_document":     selfie,
		"authorized_person_identification":      ident,
		"contact_person_first_name":             first,
		"contact_person_last_name":              last,
		"contact_person_email_address":          in.Email,
		"shareholders_include_corporate_entity": false,
		"stakeholders": []any{map[string]any{
			"roles":                []string{"BUSINESS_OWNER"},
			"first_name":           first,
			"last_name":            last,
			"nationality":          nationality,
			"date_of_birth":        in.TanggalLahir,
			"address":              addr,
			"is_authorized_person": true,
			"identification":       ident,
		}},
	}

	cc, mobile := splitMobile(in.NoHP)
	if mobile != "" {
		details["authorized_person_mobile_country_code"] = cc
		details["authorized_person_mobile_number_only"] = mobile
		details["contact_person_mobile_country_code"] = cc
		details["contact_person_mobile_number_only"] = mobile
	}
	if v := strings.TrimSpace(in.DataUsaha.RataRataTransaksiBulanan); v != "" {
		details["business_average_monthly_basket_size"] = v
	}
	if v := os.Getenv("XENDIT_KYC_BUSINESS_REGISTRATION_NUMBER"); v != "" {
		details["business_registration_number"] = v
	}
	if v := os.Getenv("XENDIT_KYC_BUSINESS_ESTABLISHMENT_DATE"); v != "" {
		details["business_establishment_date"] = v
	}
	if v := os.Getenv("PLATFORM_WEBSITE_URL"); v != "" {
		details["proof_of_business_websites"] = map[string]any{"website": v}
	}
	if ref := fileRef(serviceAgreementFileID, "service-agreement.pdf"); ref != nil {
		details["service_agreement_document"] = ref
	}

	out := map[string]any{
		"country_of_incorporation": firstNonEmpty(os.Getenv("XENDIT_ACCOUNT_COUNTRY"), "ID"),
		"business_entity_type":     strings.ToUpper(firstNonEmpty(in.EntityType, "INDIVIDUAL")),
		"kyc_details":              details,
	}
	if v := os.Getenv("XENDIT_KYC_INDUSTRY_CODE"); v != "" {
		out["business_industry_code"] = v
	}
	return out
}
