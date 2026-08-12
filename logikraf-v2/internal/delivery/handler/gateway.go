package handler

import (
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v3"
)

var gatewayPolicies = map[string]string{
	"xendit": "Xendit adalah penyelenggara jasa sistem pembayaran (PJP) yang tunduk pada regulasi Bank Indonesia. " +
		"Dana transaksi disetel (settlement) ke rekening merchant sesuai jadwal (umumnya T+3). " +
		"Biaya layanan (MDR) dipotong per transaksi; merchant bertanggung jawab atas pajak terkait. " +
		"Pengembalian dana (refund) diinisiasi oleh merchant dan dikembalikan ke metode pembayaran asal; Xendit tidak menanggung biaya chargeback. " +
		"Xendit berhak menahan (hold) dana jika terindikasi risiko/fraud.",
	"midtrans": "Midtrans adalah payment aggregator yang tunduk pada ketentuan Bank Indonesia dan peraturan berlaku. " +
		"Settlement dilakukan T+2 s.d. T+3 tergantung metode pembayaran. " +
		"Biaya admin dikenakan per transaksi sesuai kontrak; kartu kredit/debit memiliki biaya tambahan. " +
		"Merchant wajib mematuhi PCI DSS (tidak menyimpan nomor kartu utuh). " +
		"Midtrans berhak menunda settlement apabila terdapat indikasi fraud atau pelanggaran terms.",
}

func activeGatewayIDs(tenant string) []string {
	raw := setting("payment_gateways", tenant)
	if raw == "" {
		return []string{}
	}
	var ids []string
	_ = json.Unmarshal([]byte(raw), &ids)
	return ids
}

// GetPaymentGateways returns the list of payment gateways the tenant has enabled,
// each with its policy text and public client key (for Snap.js). A gateway only
// appears if it is both enabled in `payment_gateways` settings AND has its
// required secret/server key configured.
func GetPaymentGateways(c fiber.Ctx) error {
	tenant := tenantOf(c)
	enabled := activeGatewayIDs(tenant)
	gw := []map[string]any{}
	for _, id := range enabled {
		secretKey := ""
		clientKey := ""
		switch id {
		case "xendit":
			secretKey = setting("xendit_secret_key", tenant)
		case "midtrans":
			secretKey = setting("midtrans_server_key", tenant)
			clientKey = setting("midtrans_client_key", tenant)
		}
		if secretKey == "" {
			continue // enabled but not configured -> skip
		}
		name := strings.Title(id)
		entry := map[string]any{
			"id":       id,
			"name":     name,
			"active":   true,
			"policies": gatewayPolicies[id],
		}
		if clientKey != "" {
			entry["client_key"] = clientKey
		}
		gw = append(gw, entry)
	}
	return c.JSON(gw)
}
