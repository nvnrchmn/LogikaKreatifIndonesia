package handler

import (
	"fmt"
	"strings"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ReconcileQrisPaid — jembatan manual untuk pembayaran QRIS yang sudah lunas tapi
// Order-nya belum ada (mis. webhook sempat gagal). Membuat order + kwitansi +
// notifikasi. Aman dipanggil ulang: order yang sudah ada tidak dinotifikasi dua kali.
func ReconcileQrisPaid(reference string) ([]string, error) {
	q := model.DB.Where("status = ?", "paid")
	if strings.TrimSpace(reference) != "" {
		q = model.DB.Where("reference_id = ? OR external_id = ?", reference, reference)
	}
	var items []model.QrisPayment
	if err := q.Order("id desc").Limit(50).Find(&items).Error; err != nil {
		return nil, err
	}
	out := []string{}
	for i := range items {
		p := items[i]
		if p.ExternalID == "" {
			continue
		}
		var before int64
		model.DB.Model(&model.Order{}).Where("order_number = ?", p.ExternalID).Count(&before)
		ensureOrderForQris(&p)
		var after int64
		model.DB.Model(&model.Order{}).Where("order_number = ?", p.ExternalID).Count(&after)
		label := p.ReferenceID
		if before == 0 {
			label += " [order dibuat]"
		} else {
			label += " [order sudah ada]"
		}
		out = append(out, fmt.Sprintf("%s status=%s amount=%d", label, p.Status, p.Amount))
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("tidak ada pembayaran QRIS lunas yang cocok")
	}
	return out, nil
}
