package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ============================================================================
// Client Store ↔ sub-akun tenant (XenPlatform) & payout.
//
// Semua endpoint memakai autentikasi header X-Internal-Key (client store) dan
// memanggil Xendit memakai kunci master Logikraf dengan header for-user-id
// (sub-akun tenant). Client store TIDAK pernah memegang kunci Xendit.
//
// Alur arsitektur:
//   Logikraf (master Xendit) ── sub-akun per tenant ── Smarthub (SaaS multi-tenant)
//   iuran/tagihan warga → sub-akun tenant → settlement/payout diinisiasi dari Smarthub
// ============================================================================

const payoutAPIVersion = "2025-09-01"

var partnerHTTP = &http.Client{Timeout: 30 * time.Second}

func xenditError(c fiber.Ctx, status int, raw []byte) error {
	msg := strings.TrimSpace(string(raw))
	if len(msg) > 300 {
		msg = msg[:300]
	}
	return c.Status(status).JSON(fiber.Map{"error": "provider_error", "detail": msg})
}

// ---------------------------------------------------------------- accounts --

// CreateClientStoreAccount — POST /api/client-store/accounts
// Body: {tenant_ref, legal_name, email, entity_type?, business_name?}
// Membuat Managed Sub-account XenPlatform untuk satu tenant, lalu menyimpannya
// di client_sub_accounts sehingga QRIS/payout tenant bisa memakai for-user-id.
func CreateClientStoreAccount(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	var in struct {
		TenantRef    string `json:"tenant_ref"`
		LegalName    string `json:"legal_name"`
		BusinessName string `json:"business_name"`
		Email        string `json:"email"`
		EntityType   string `json:"entity_type"`
		Description  string `json:"description"`
		Country      string `json:"country"`
	}
	if err := c.Bind().Body(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	in.TenantRef = strings.TrimSpace(in.TenantRef)
	in.Email = strings.TrimSpace(in.Email)
	name := strings.TrimSpace(in.LegalName)
	if name == "" {
		name = strings.TrimSpace(in.BusinessName)
	}
	if in.TenantRef == "" || in.Email == "" || name == "" {
		return fiber.NewError(fiber.StatusBadRequest, "tenant_ref, email, dan legal_name wajib diisi")
	}
	if strings.TrimSpace(in.Country) == "" {
		in.Country = "ID"
	}
	entity := strings.ToUpper(strings.TrimSpace(in.EntityType))
	if entity == "" {
		entity = "INDIVIDUAL"
	}

	secret := xenditPlatformSecret()
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}

	// Idempoten: kalau tenant sudah punya sub-akun, kembalikan yang ada.
	if existing, err := resolveSubAccount(store.ID, "", in.TenantRef); err == nil && existing != nil && existing.SubAccountID != "" {
		return c.JSON(fiber.Map{
			"id": existing.SubAccountID, "status": existing.StatusKYC,
			"tenant_ref": existing.TenantRef, "reused": true,
		})
	}

	country := strings.ToUpper(firstNonEmpty(in.Country, os.Getenv("XENDIT_ACCOUNT_COUNTRY"), "ID"))
	// Xendit /v2/accounts (type MANAGED). `/v3/accounts` tidak diizinkan untuk
	// akun ini (lihat fix pada xen_account_create.go). `entity` tetap disimpan
	// lokal di ClientSubAccount untuk keperluan pemetaan KYC.
	publicProfile := map[string]any{
		"business_name": name,
		"country":       country,
	}
	if d := strings.TrimSpace(in.Description); d != "" {
		publicProfile["description"] = d
	}
	payload := map[string]any{
		"email":          in.Email,
		"type":           "MANAGED",
		"public_profile": publicProfile,
	}
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/v2/accounts", bytes.NewReader(bodyBytes))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", xenditPlatformAuth(secret))
	req.Header.Set("Content-Type", "application/json")
	resp, err := partnerHTTP.Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi provider")
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return xenditError(c, resp.StatusCode, raw)
	}
	var created struct {
		ID     string `json:"id"`
		Status string `json:"status"`
		Email  string `json:"email"`
	}
	if err := json.Unmarshal(raw, &created); err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "respons provider tidak valid")
	}

	sub := model.ClientSubAccount{}
	if err := model.DB.Where("store_id = ? AND tenant_ref = ?", store.ID, in.TenantRef).First(&sub).Error; err != nil {
		sub = model.ClientSubAccount{StoreID: store.ID, TenantRef: in.TenantRef}
	}
	sub.SubAccountID = created.ID
	sub.LegalName = name
	sub.Email = in.Email
	sub.EntityType = entity
	sub.StatusKYC = strings.ToUpper(created.Status)
	if sub.StatusKYC == "" {
		sub.StatusKYC = "REGISTERED"
	}
	if err := model.DB.Save(&sub).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal menyimpan sub-akun")
	}
	return c.Status(201).JSON(fiber.Map{
		"id": created.ID, "status": sub.StatusKYC, "tenant_ref": sub.TenantRef, "email": created.Email,
	})
}

// GetClientStoreAccount — GET /api/client-store/accounts/:id
// :id boleh sub_account_id Xendit; alternatif ?tenant_ref=<ref>.
func GetClientStoreAccount(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	sub, err := resolveSubAccount(store.ID, c.Params("id"), c.Query("tenant_ref"))
	if err != nil || sub == nil {
		return fiber.NewError(fiber.StatusNotFound, "sub-akun tidak ditemukan")
	}
	if sub.SubAccountID != "" {
		if detail, _, _, ferr := fetchXenAccount(sub.SubAccountID); ferr == nil && detail.Status != "" {
			status := strings.ToUpper(detail.Status)
			if status != sub.StatusKYC {
				sub.StatusKYC = status
				_ = model.DB.Save(sub).Error
			}
		}
	}
	return c.JSON(fiber.Map{
		"id": sub.SubAccountID, "tenant_ref": sub.TenantRef, "status": sub.StatusKYC,
		"entity_type": sub.EntityType, "money_out_enabled": sub.MoneyOutEnabled,
		"payment_channels": sub.ChannelsJSON, "failure_reasons": sub.FailureJSON,
	})
}

// ----------------------------------------------------------------- payout ---

// CreateClientStorePayout — POST /api/client-store/payouts
// Body: {external_id, for_user_id?|account_id?|tenant_ref?, amount, description?, recipient{bank_code,account_holder_name,account_number}}
// Idempoten terhadap external_id (reference_id) — retry tidak menggandakan.
func CreateClientStorePayout(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	var in struct {
		ExternalID  string `json:"external_id"`
		ForUserID   string `json:"for_user_id"`
		AccountID   string `json:"account_id"`
		TenantRef   string `json:"tenant_ref"`
		Amount      int    `json:"amount"`
		Description string `json:"description"`
		Recipient   struct {
			BankCode      string `json:"bank_code"`
			AccountHolder string `json:"account_holder_name"`
			AccountNumber string `json:"account_number"`
		} `json:"recipient"`
	}
	if err := c.Bind().Body(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	in.ExternalID = strings.TrimSpace(in.ExternalID)
	if in.ExternalID == "" || in.Amount <= 0 || strings.TrimSpace(in.Recipient.BankCode) == "" ||
		strings.TrimSpace(in.Recipient.AccountNumber) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "external_id, amount, recipient.bank_code, recipient.account_number wajib diisi")
	}
	accountID := firstNonEmpty(in.AccountID, in.ForUserID)
	sub, err := resolveSubAccount(store.ID, accountID, in.TenantRef)
	if err != nil || sub == nil || sub.SubAccountID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "sub-akun tenant tidak ditemukan / belum punya akun provider")
	}

	// Idempoten: kalau payout dengan external_id sama sudah pernah dibuat.
	var existing model.Payout
	if err := model.DB.Where("store_id = ? AND external_id = ?", store.ID, in.ExternalID).First(&existing).Error; err == nil {
		return c.JSON(fiber.Map{
			"id": existing.ProviderID, "external_id": existing.ExternalID,
			"status": existing.Status, "reused": true,
		})
	}

	secret := xenditPlatformSecret()
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}
	// Xendit Payouts v3 (openapi 2025-09-01). Bentuk body jauh berbeda dari v2:
	// recipient.account_details + payout_details + source_of_fund + purpose_code.
	holder := strings.TrimSpace(in.Recipient.AccountHolder)
	bank := strings.ToUpper(strings.TrimSpace(in.Recipient.BankCode))
	// Routing bank Indonesia belum ada di enum global docs; dapat disetel via env.
	routingType := orDefault(os.Getenv("XENDIT_PAYOUT_ROUTING_TYPE"), "BANK_CODE")
	payload := map[string]any{
		"reference_id": in.ExternalID,
		"recipient": map[string]any{
			"type":          "BUSINESS",
			"business_name": orDefault(holder, "Tenant"),
			"relationship":  "CUSTOMER",
			"account_details": map[string]any{
				"currency":            "IDR",
				"account_country":     "ID",
				"account_holder_name": holder,
				"account_number":      strings.TrimSpace(in.Recipient.AccountNumber),
				"routing_type_1":      routingType,
				"routing_value_1":     bank,
			},
			"address": map[string]any{"country": "ID"},
		},
		"payout_details": map[string]any{
			"source_currency":      "IDR",
			"source_amount":        in.Amount,
			"destination_currency": "IDR",
		},
		"source_of_fund": "BUSINESS_REVENUE",
		"purpose_code":   "OTHER",
		"description":    orDefault(in.Description, "Pencairan dana"),
	}
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/v3/payouts", bytes.NewReader(bodyBytes))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", xenditPlatformAuth(secret))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-version", payoutAPIVersion)
	req.Header.Set("for-user-id", sub.SubAccountID)
	req.Header.Set("idempotency-key", in.ExternalID)
	resp, err := partnerHTTP.Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi provider")
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))

	// Duplikat idempotency di sisi provider = payout sudah ada → sukses idempoten.
	if resp.StatusCode >= 400 {
		kode := strings.ToLower(string(raw))
		if strings.Contains(kode, "duplicate") || strings.Contains(kode, "already") || strings.Contains(kode, "idempotency") {
			return c.JSON(fiber.Map{"external_id": in.ExternalID, "status": "DUPLICATE_ERROR", "reused": true})
		}
		return xenditError(c, resp.StatusCode, raw)
	}
	var out struct {
		PayoutID      string `json:"payout_id"` // v3 memakai payout_id, bukan id
		ReferenceID   string `json:"reference_id"`
		Status        string `json:"status"`
		FailureCode   string `json:"failure_code"`
		FailureReason string `json:"failure_reason"`
	}
	_ = json.Unmarshal(raw, &out)
	recJSON, _ := json.Marshal(in.Recipient)
	row := model.Payout{
		StoreID: store.ID, SubAccountID: sub.SubAccountID, TenantRef: sub.TenantRef,
		ExternalID: in.ExternalID, ProviderID: out.PayoutID, Amount: in.Amount, Currency: "IDR",
		Status: statusPayoutNormalized(out.Status), FailureCode: out.FailureCode,
		FailureReason: out.FailureReason, RecipientJSON: string(recJSON), RawProvider: string(raw),
	}
	if err := model.DB.Create(&row).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal menyimpan payout")
	}
	return c.Status(mapPayoutHTTP(resp.StatusCode)).JSON(fiber.Map{
		"id": row.ProviderID, "external_id": row.ExternalID, "status": row.Status,
	})
}

// GetClientStorePayout — GET /api/client-store/payouts/:id (provider id atau external_id)
func GetClientStorePayout(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	id := strings.TrimSpace(c.Params("id"))
	var row model.Payout
	if err := model.DB.Where("store_id = ? AND (provider_id = ? OR external_id = ?)", store.ID, id, id).First(&row).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "payout tidak ditemukan")
	}
	return c.JSON(fiber.Map{
		"id": row.ProviderID, "external_id": row.ExternalID, "status": row.Status,
		"amount": row.Amount, "currency": row.Currency,
		"failure_code": row.FailureCode, "failure_reason": row.FailureReason,
	})
}

// ----------------------------------------------------------------- balance --

// GetClientStoreBalance — GET /api/client-store/balance?account_id=&tenant_ref=
func GetClientStoreBalance(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	accountID := firstNonEmpty(c.Query("account_id"), c.Query("for_user_id"))
	sub, err := resolveSubAccount(store.ID, accountID, c.Query("tenant_ref"))
	if err != nil || sub == nil || sub.SubAccountID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "sub-akun tenant tidak ditemukan")
	}
	secret := xenditPlatformSecret()
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}
	req, err := http.NewRequest(http.MethodGet, "https://api.xendit.co/balance?account_type=CASH", nil)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", xenditPlatformAuth(secret))
	req.Header.Set("for-user-id", sub.SubAccountID)
	resp, err := partnerHTTP.Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi provider")
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != 200 {
		return xenditError(c, resp.StatusCode, raw)
	}
	var out struct {
		Balance int `json:"balance"`
	}
	_ = json.Unmarshal(raw, &out)
	return c.JSON(fiber.Map{"available": out.Balance, "currency": "IDR"})
}

// --------------------------------------------------------------------- KYC --

// CreateClientStoreKycFile — POST /api/client-store/kyc/files (multipart)
// Form: account_id|tenant_ref, file
func CreateClientStoreKycFile(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	accountID := firstNonEmpty(c.FormValue("account_id"), c.FormValue("for_user_id"))
	sub, err := resolveSubAccount(store.ID, accountID, c.FormValue("tenant_ref"))
	if err != nil || sub == nil || sub.SubAccountID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "sub-akun tenant tidak ditemukan")
	}
	file, ferr := c.FormFile("file")
	if ferr != nil || file == nil {
		return fiber.NewError(fiber.StatusBadRequest, "file wajib diunggah")
	}
	secret := xenditPlatformSecret()
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}
	src, err := file.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "gagal membaca file")
	}
	defer src.Close()
	data, err := io.ReadAll(io.LimitReader(src, 10<<20))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membaca file")
	}

	fileID, status, raw := uploadFileToProvider(secret, sub.SubAccountID, file.Filename, data)
	if fileID == "" {
		if status == 0 {
			return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi provider")
		}
		return xenditError(c, status, raw)
	}
	return c.Status(201).JSON(fiber.Map{"file_id": fileID})
}

// SubmitClientStoreKyc — POST /api/client-store/kyc/submit
// Body: payload `account_verification` Xendit (bebas) + for_user_id|account_id|tenant_ref.
// Hub meneruskan apa adanya dengan header for-user-id (thin proxy) sehingga
// skema field bisa mengikuti kontrak Xendit tanpa diduplikasi di Hub.
func SubmitClientStoreKyc(c fiber.Ctx) error {
	store, ok := resolveClientStore(c)
	if !ok {
		return clientStoreAuthError(c)
	}
	var body map[string]any
	if err := c.Bind().Body(&body); err != nil || body == nil {
		return fiber.NewError(fiber.StatusBadRequest, "body tidak valid")
	}
	accountID := firstNonEmpty(strOf(body["account_id"]), strOf(body["for_user_id"]))
	sub, err := resolveSubAccount(store.ID, accountID, strOf(body["tenant_ref"]))
	if err != nil || sub == nil || sub.SubAccountID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "sub-akun tenant tidak ditemukan")
	}

	secret := xenditPlatformSecret()
	if secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "xendit_secret_key belum dikonfigurasi")
	}

	// Persetujuan clickwrap wajib: validasi versi+hash, generate PDF bukti,
	// unggah ke provider, lalu lampirkan sebagai service_agreement_document.
	consentRaw, _ := body["consent"].(map[string]any)
	if consentRaw == nil {
		return fiber.NewError(fiber.StatusBadRequest, "consent wajib diisi")
	}
	consent := kycConsentInput{
		Version:    strOf(consentRaw["version"]),
		Hash:       strOf(consentRaw["hash"]),
		AgreedAt:   strOf(consentRaw["agreed_at"]),
		IP:         strOf(consentRaw["ip"]),
		UserAgent:  strOf(consentRaw["user_agent"]),
		LogID:      strOf(consentRaw["log_id"]),
		SignerName: strOf(consentRaw["signer_name"]),
	}
	if verr := validateConsent(consent); verr != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, verr.Error())
	}
	identity := map[string]string{
		"legal_name":     firstNonEmpty(strOf(body["legal_name"]), sub.LegalName),
		"email":          firstNonEmpty(strOf(body["email"]), sub.Email),
		"tenant_ref":     sub.TenantRef,
		"entity_type":    firstNonEmpty(strOf(body["entity_type"]), sub.EntityType),
		"sub_account_id": sub.SubAccountID,
	}
	pdfBytes, perr := renderServiceAgreementPDF(identity, consent)
	if perr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat dokumen perjanjian")
	}
	fileID, statusFile, rawFile := uploadFileToProvider(secret, sub.SubAccountID, "service-agreement.pdf", pdfBytes)
	if fileID == "" {
		if statusFile == 0 {
			return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi provider")
		}
		return xenditError(c, statusFile, rawFile)
	}
	persistAgreement(store.ID, sub, consent, fileID)

	// Susun payload Xendit account_verification dari input SmartHub (mapping penuh).
	in := kycSubmitInput{
		LegalName:       strOf(body["legal_name"]),
		Email:           strOf(body["email"]),
		KtpNumber:       strOf(body["ktp_number"]),
		TanggalLahir:    strOf(body["tanggal_lahir"]),
		JenisKelamin:    strOf(body["jenis_kelamin"]),
		Kewarganegaraan: strOf(body["kewarganegaraan"]),
		NoHP:            strOf(body["no_hp"]),
		EntityType:      firstNonEmpty(strOf(body["entity_type"]), sub.EntityType, "INDIVIDUAL"),
		SignerName:      consent.SignerName,
	}
	if a := mapOf(body["alamat"]); a != nil {
		in.Alamat = kycAddressInput{
			Alamat: strOf(a["alamat"]), Kota: strOf(a["kota"]), Provinsi: strOf(a["provinsi"]),
			KodePos: strOf(a["kode_pos"]), Kecamatan: strOf(a["kecamatan"]), Kelurahan: strOf(a["kelurahan"]),
		}
	}
	if u := mapOf(body["data_usaha"]); u != nil {
		in.DataUsaha = kycDataUsahaInput{
			NamaLegal: strOf(u["nama_legal"]), Deskripsi: strOf(u["deskripsi"]),
			SumberDana: strOf(u["sumber_dana"]), RataRataTransaksiBulanan: strOf(u["rata_rata_transaksi_bulanan"]),
		}
	}
	if f := mapOf(body["files"]); f != nil {
		in.Files = kycFilesInput{
			KtpDepan: strOf(f["ktp_depan"]), KtpBelakang: strOf(f["ktp_belakang"]), Selfie: strOf(f["selfie"]),
		}
	}
	payload := buildAccountVerification(in, fileID)
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, "https://api.xendit.co/account_verification", bytes.NewReader(bodyBytes))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "gagal membuat request")
	}
	req.Header.Set("Authorization", xenditPlatformAuth(secret))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("for-user-id", sub.SubAccountID)
	resp, err := partnerHTTP.Do(req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadGateway, "tidak dapat menghubungi provider")
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return xenditError(c, resp.StatusCode, raw)
	}
	var out struct {
		Status         string `json:"status"`
		FailureReasons any    `json:"failure_reasons"`
	}
	_ = json.Unmarshal(raw, &out)
	failJSON, _ := json.Marshal(out.FailureReasons)
	if out.Status != "" {
		sub.StatusKYC = strings.ToUpper(out.Status)
	}
	sub.FailureJSON = string(failJSON)
	_ = model.DB.Save(sub).Error
	return c.JSON(fiber.Map{
		"status": sub.StatusKYC, "failure_reasons": out.FailureReasons,
		"service_agreement_document": fileID,
	})
}

// ------------------------------------------------------------------ helpers --

func firstNonEmpty(vals ...string) string {
	for _, v := range vals {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

func strOf(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func statusPayoutNormalized(s string) string {
	switch strings.ToUpper(strings.TrimSpace(s)) {
	case "ACCEPTED", "REQUESTED", "READY", "LOCKED", "PENDING_COMPLIANCE_REVIEW", "PENDING":
		return "MENUNGGU"
	case "ROUTING", "PROCESSING":
		return "PROCESSING"
	case "SUCCEEDED", "COMPLETED", "PAID":
		return "SELESAI"
	case "FAILED", "REJECTED", "EXPIRED", "REVERSED", "CANCELLED", "VOIDED", "REQUIRES_ACTION":
		return "GAGAL"
	default:
		if s == "" {
			return "MENUNGGU"
		}
		return strings.ToUpper(strings.TrimSpace(s))
	}
}

func mapPayoutHTTP(status int) int {
	if status < 200 || status >= 300 {
		return 200
	}
	return status
}
