package handler

import (
	"encoding/json"
	"strings"

	"github.com/gofiber/fiber/v3"
)

var gatewayPolicies = map[string]string{
	"ipaymu": "iPaymu adalah penyelenggara payment gateway resmi berlisensi Bank Indonesia (PJP Kategori 3). " +
		"Pembayaran diproses secara instan melalui QRIS Dinamis yang dapat dipindai dari seluruh aplikasi Mobile Banking (BCA Mobile, Livin' Mandiri, BRImo, BNI Mobile, PermataMobile, CIMB OCTO) serta E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja). " +
		"Verifikasi pembayaran berlangsung secara otomatis dan real-time dalam hitungan detik. " +
		"Semua transaksi aman terenkripsi SSL 256-bit dan proses pengembalian dana (refund) diproses sesuai Kebijakan Refund resmi Logikraf.",
	"midtrans": "Midtrans adalah payment aggregator berlisensi Bank Indonesia yang memproses pembayaran instan melalui QRIS (GoPay, ShopeePay, & seluruh aplikasi perbankan berstandar QRIS).",
	"xendit":   "Xendit adalah penyelenggara sistem pembayaran berlisensi Bank Indonesia yang memproses pembayaran digital melalui QRIS real-time.",
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
		case "ipaymu":
			secretKey = setting("ipaymu_master_key", tenant)
			clientKey = setting("ipaymu_master_va", tenant)
		}
		if secretKey == "" {
			continue // enabled but not configured -> skip
		}
		name := strings.Title(id)
		if id == "ipaymu" {
			name = "iPaymu"
		}
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
