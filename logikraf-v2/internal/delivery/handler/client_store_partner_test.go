package handler

import (
	"testing"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func TestStatusPayoutNormalized(t *testing.T) {
	cases := map[string]string{
		"ACCEPTED":                  "MENUNGGU",
		"REQUESTED":                 "MENUNGGU",
		"PENDING_COMPLIANCE_REVIEW": "MENUNGGU",
		"ROUTING":                   "PROCESSING",
		"PROCESSING":                "PROCESSING",
		"SUCCEEDED":                 "SELESAI",
		"COMPLETED":                 "SELESAI",
		"FAILED":                    "GAGAL",
		"REJECTED":                  "GAGAL",
		"REQUIRES_ACTION":           "GAGAL",
		"VOIDED":                    "GAGAL",
		"":                          "MENUNGGU",
	}
	for in, want := range cases {
		if got := statusPayoutNormalized(in); got != want {
			t.Errorf("statusPayoutNormalized(%q)=%q want %q", in, got, want)
		}
	}
}

func TestHMACSignatureDeterministic(t *testing.T) {
	got := hmacSHA256Hex("rahasia", []byte(`{"a":1}`))
	if len(got) != 64 {
		t.Fatalf("hmac bukan hex sha256: %q", got)
	}
	if got != hmacSHA256Hex("rahasia", []byte(`{"a":1}`)) {
		t.Fatal("hmac tidak deterministik")
	}
	if got == hmacSHA256Hex("lain", []byte(`{"a":1}`)) {
		t.Fatal("hmac tidak berubah saat secret berbeda")
	}
	if got == hmacSHA256Hex("rahasia", []byte(`{"a":2}`)) {
		t.Fatal("hmac tidak berubah saat body berbeda")
	}
}

func TestAgreementAndConsent(t *testing.T) {
	version, text, hash := currentAgreement()
	if version != "v1" {
		t.Fatalf("versi perjanjian tak terduga: %q", version)
	}
	if len(hash) != 64 || text == "" {
		t.Fatalf("hash/teks perjanjian tidak valid (len hash=%d)", len(hash))
	}
	if agreementHash(text) != hash {
		t.Fatal("hash tidak deterministik")
	}

	ok := kycConsentInput{
		Version: version, Hash: hash, AgreedAt: "2026-09-24T22:00:00+07:00",
		IP: "127.0.0.1", UserAgent: "vitest", LogID: "log-1", SignerName: "Ketua RT",
	}
	if err := validateConsent(ok); err != nil {
		t.Fatalf("consent valid ditolak: %v", err)
	}
	if err := validateConsent(kycConsentInput{Version: "v0", Hash: hash, AgreedAt: "x", LogID: "l", SignerName: "s"}); err == nil {
		t.Fatal("versi salah harus ditolak")
	}
	badHash := ok
	badHash.Hash = "0000"
	if err := validateConsent(badHash); err == nil {
		t.Fatal("hash salah harus ditolak")
	}
	missing := ok
	missing.LogID = ""
	if err := validateConsent(missing); err == nil {
		t.Fatal("log_id kosong harus ditolak")
	}

	pdf, err := renderServiceAgreementPDF(map[string]string{"legal_name": "RT 05"}, ok)
	if err != nil || len(pdf) < 100 || string(pdf[:4]) != "%PDF" {
		t.Fatalf("render PDF gagal (len=%d err=%v)", len(pdf), err)
	}
}

func TestBuildAccountVerification(t *testing.T) {
	in := kycSubmitInput{
		LegalName: "RT 05 Melati", Email: "rt05@test.local",
		KtpNumber: "3273019900007777", TanggalLahir: "1990-01-01",
		JenisKelamin: "MALE", Kewarganegaraan: "WNI", NoHP: "08123456789",
		EntityType: "INDIVIDUAL", SignerName: "Budi Santoso",
		Alamat: kycAddressInput{Alamat: "Jl. Mawar 1", Kota: "Jakarta", Provinsi: "DKI Jakarta", KodePos: "12345"},
		DataUsaha: kycDataUsahaInput{
			NamaLegal: "RT 05", Deskripsi: "Pengelolaan iuran warga",
			SumberDana: "REVENUE", RataRataTransaksiBulanan: "$0 - $50K",
		},
		Files: kycFilesInput{KtpDepan: "f1", KtpBelakang: "f2", Selfie: "f3"},
	}

	out := buildAccountVerification(in, "sa-1")
	if out["country_of_incorporation"] != "ID" || out["business_entity_type"] != "INDIVIDUAL" {
		t.Fatalf("top-level mapping salah: %+v", out)
	}
	details, ok := out["kyc_details"].(map[string]any)
	if !ok {
		t.Fatal("kyc_details tidak ada")
	}
	if details["authorized_person_first_name"] != "Budi" || details["authorized_person_last_name"] != "Santoso" {
		t.Fatalf("nama authorized person salah: %v", details)
	}
	if details["authorized_person_nationality"] != "ID" || details["authorized_person_gender"] != "MALE" {
		t.Fatal("nationality/gender mapping salah")
	}
	if details["business_average_monthly_basket_size"] != "$0 - $50K" {
		t.Fatal("basket size tidak dipetakan")
	}
	if details["contact_person_mobile_number_only"] != "8123456789" {
		t.Fatalf("mobile mapping salah: %v", details["contact_person_mobile_number_only"])
	}
	funds, ok := details["business_source_of_funds"].([]string)
	if !ok || len(funds) != 1 || funds[0] != "REVENUE" {
		t.Fatalf("source of funds salah: %v", details["business_source_of_funds"])
	}
	ident, ok := details["authorized_person_identification"].([]any)
	if !ok || len(ident) != 1 {
		t.Fatal("identification tidak valid")
	}
	item := ident[0].(map[string]any)
	if item["type"] != "ID_NATIONAL_ID_KTP" || item["number"] != "3273019900007777" {
		t.Fatalf("identification mapping salah: %+v", item)
	}
	sa, ok := details["service_agreement_document"].(map[string]any)
	if !ok || sa["file_id"] != "sa-1" || sa["file_name"] != "service-agreement.pdf" {
		t.Fatalf("service agreement mapping salah: %v", details["service_agreement_document"])
	}
	addr, ok := details["business_address"].(map[string]any)
	if !ok || addr["country_code"] != "ID" || addr["city"] != "Jakarta" {
		t.Fatalf("address mapping salah: %v", details["business_address"])
	}
}

func TestResolveSubAccount(t *testing.T) {
	store := model.ClientStore{Slug: "t-store", Name: "T Store", IsActive: true, InternalKey: "k"}
	if err := model.DB.Create(&store).Error; err != nil {
		t.Fatal(err)
	}
	sub := model.ClientSubAccount{
		StoreID: store.ID, TenantRef: "tenant-1", SubAccountID: "xen-abc",
		EntityType: "INDIVIDUAL", StatusKYC: "LIVE",
	}
	if err := model.DB.Create(&sub).Error; err != nil {
		t.Fatal(err)
	}

	byTenant, err := resolveSubAccount(store.ID, "", "tenant-1")
	if err != nil || byTenant == nil || byTenant.SubAccountID != "xen-abc" {
		t.Fatalf("resolve by tenant_ref gagal: %+v err=%v", byTenant, err)
	}
	byID, err := resolveSubAccount(store.ID, "xen-abc", "")
	if err != nil || byID == nil || byID.TenantRef != "tenant-1" {
		t.Fatalf("resolve by sub_account_id gagal: %+v err=%v", byID, err)
	}
	if _, err := resolveSubAccount(store.ID, "tidak-ada", ""); err == nil {
		t.Fatal("harus error utk sub-akun yang tidak ada")
	}
}
