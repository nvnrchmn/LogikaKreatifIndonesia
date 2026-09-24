package model

import "time"

// ClientSubAccount — sub-akun XenPlatform milik satu TENANT di dalam sebuah
// ClientStore. Untuk Smarthub: satu ClientStore ("smarthub") punya banyak
// sub-akun, satu per RT (tenant_ref = id_tenant). Dana iuran warga masuk ke
// sub-akun tenant, dan pencairan (settlement) diinisiasi atas nama sub-akun ini.
//
// Berbeda dengan ClientStore.SubAccountID (satu sub-akun untuk seluruh store),
// tabel ini memungkinkan multi-tenant per store.
type ClientSubAccount struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	StoreID         uint      `gorm:"index;not null" json:"store_id"`
	TenantRef       string    `gorm:"size:80;index;not null" json:"tenant_ref"`   // id_tenant di produk SaaS
	SubAccountID    string    `gorm:"size:120;uniqueIndex" json:"sub_account_id"` // Business ID Managed Sub-account Xendit
	LegalName       string    `gorm:"size:150" json:"legal_name"`
	Email           string    `gorm:"size:150" json:"email"`
	EntityType      string    `gorm:"size:40;default:INDIVIDUAL" json:"entity_type"`
	StatusKYC       string    `gorm:"size:40;default:REGISTERED" json:"status_kyc"`
	MoneyOutEnabled bool      `gorm:"default:false" json:"money_out_enabled"`
	ChannelsJSON    string    `gorm:"type:text" json:"channels_json"` // kanal aktif (json), dinormalisasi saat webhook
	FailureJSON     string    `gorm:"type:text" json:"failure_json"`  // alasan penolakan KYC (json)
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (ClientSubAccount) TableName() string { return "client_sub_accounts" }
