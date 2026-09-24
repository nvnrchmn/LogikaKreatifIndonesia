package model

import "time"

// KycAgreement — jejak persetujuan elektronik (clickwrap) tenant atas perjanjian
// layanan & pembagian data KYC ke penyedia. Menyimpan hash naskah + bukti teknis
// (waktu, IP, user-agent, log id) dan file_id service agreement yang diunggah.
type KycAgreement struct {
	ID                     uint      `gorm:"primaryKey" json:"id"`
	StoreID                uint      `gorm:"index" json:"store_id"`
	TenantRef              string    `gorm:"size:80;index" json:"tenant_ref"`
	SubAccountID           string    `gorm:"size:120;index" json:"sub_account_id"`
	Version                string    `gorm:"size:20" json:"version"`
	TextHash               string    `gorm:"size:64" json:"text_hash"`
	LogID                  string    `gorm:"size:80;index" json:"log_id"`
	SignerName             string    `gorm:"size:150" json:"signer_name"`
	IP                     string    `gorm:"size:60" json:"ip"`
	UserAgent              string    `gorm:"size:255" json:"user_agent"`
	AgreedAt               string    `gorm:"size:40" json:"agreed_at"`
	ServiceAgreementFileID string    `gorm:"size:120" json:"service_agreement_file_id"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
}

func (KycAgreement) TableName() string { return "kyc_agreements" }
