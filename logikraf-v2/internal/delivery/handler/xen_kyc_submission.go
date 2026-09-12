package handler

import (
	"encoding/json"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// saveKYCSubmission — simpan riwayat submission KYC + alasan penolakan ke tabel
// kyc_submissions supaya portal mitra bisa menampilkan apa yang perlu diperbaiki.
func saveKYCSubmission(storeID uint, subID, status, entityType string, reasons []kycReason) {
	if model.DB == nil || status == "" {
		return
	}
	notes := ""
	if len(reasons) > 0 {
		if b, err := json.Marshal(reasons); err == nil {
			notes = string(b)
		}
	}
	var last struct {
		ID     uint
		Status string
		Notes  string
	}
	model.DB.Table("kyc_submissions").Select("id, status, notes").
		Where("client_store_id = ?", storeID).Order("id DESC").Limit(1).Scan(&last)
	if last.ID != 0 && last.Status == status && last.Notes == notes {
		return
	}
	model.DB.Exec(`INSERT INTO kyc_submissions
		(client_store_id, xendit_sub_id, status, entity_type, notes, created_at, updated_at)
		VALUES (?,?,?,?,?,NOW(3),NOW(3))`, storeID, subID, status, entityType, notes)
}
