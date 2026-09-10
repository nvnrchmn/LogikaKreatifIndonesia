package handler

import (
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// ListPlatformFees — laporan biaya layanan platform per store per periode.
// Dipakai owner (superadmin) untuk melihat tagihan/pemotongan: total GMV, fee 2%,
// biaya operasional bulanan, cek minimum, dan diskon volume otomatis.
func ListPlatformFees(c fiber.Ctx) error {
	period := c.Query("period")
	if period == "" {
		period = time.Now().Format("2006-01")
	}
	storeID := c.Query("store_id")

	q := model.DB.Model(&model.PlatformFee{}).Where("period = ?", period)
	if storeID != "" {
		q = q.Where("store_id = ?", storeID)
	}
	var rows []model.PlatformFee
	if err := q.Order("created_at asc").Find(&rows).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "db error"})
	}

	gross := 0
	baseFee := 0
	for _, r := range rows {
		if r.Status == "reversed" {
			continue
		}
		gross += r.Gross
		baseFee += r.FeeAmount
	}

	// Diskon volume otomatis (insentif pertumbuhan)
	effPct := 0.0
	switch {
	case gross > 50_000_000:
		effPct = 1.0
	case gross > 25_000_000:
		effPct = 1.5
	default:
		effPct = 0
	}
	feeFinal := baseFee
	discountNote := ""
	if effPct > 0 {
		feeFinal = int(float64(gross) * effPct / 100.0)
		discountNote = "diskon volume diterapkan"
	}

	// Konfigurasi store (biaya operasional + minimum)
	fixed, minMonthly, waived := 0, 0, false
	if storeID != "" {
		var st model.ClientStore
		if err := model.DB.Where("id = ?", storeID).First(&st).Error; err == nil {
			fixed = st.FeeMonthlyFixed
			minMonthly = st.FeeMinMonthly
			if st.FeeWaivedUntil != nil && time.Now().Before(*st.FeeWaivedUntil) {
				waived = true
			}
		}
	}
	total := fixed + feeFinal
	minApplied := false
	if !waived && minMonthly > 0 && total < minMonthly {
		total = minMonthly
		minApplied = true
	}

	return c.JSON(fiber.Map{
		"period":        period,
		"store_id":      storeID,
		"transactions":  len(rows),
		"gross":         gross,
		"fee_base":      baseFee,
		"fee_final":     feeFinal,
		"discount_note": discountNote,
		"monthly_fixed": fixed,
		"min_monthly":   minMonthly,
		"min_waived":    waived,
		"min_applied":   minApplied,
		"total_due":     total,
		"rows":          rows,
	})
}
