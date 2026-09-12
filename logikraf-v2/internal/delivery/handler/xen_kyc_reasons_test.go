package handler

import (
	"encoding/json"
	"testing"
)

func TestCollectFailureReasons(t *testing.T) {
	raw := `{"event":"account.verification","data":{"account_id":"6a9ff4fba5931d2861ac384c","kyc":{"status":"AWAITING_DOCS","failure_reasons":[{"field":"business_website","reason":"WEBSITE_INCOMPLETE","message":"This contents of this website are incomplete."},{"field":"id_selfie_with_ktp_document","reason":"UNSPECIFIED"},{"field":"id_authorized_person_ktp_document","reason":"UNSPECIFIED"}]}}}`
	var body map[string]any
	if err := json.Unmarshal([]byte(raw), &body); err != nil {
		t.Fatal(err)
	}
	var out []kycReason
	collectFailureReasons(body, &out)
	if len(out) != 3 {
		t.Fatalf("harus 3 alasan, dapat %d: %+v", len(out), out)
	}
	if out[0].Field != "business_website" || out[0].Reason != "WEBSITE_INCOMPLETE" {
		t.Fatalf("alasan pertama salah: %+v", out[0])
	}
	if out[1].Field != "id_selfie_with_ktp_document" {
		t.Fatalf("alasan kedua salah: %+v", out[1])
	}
	t.Logf("OK: %d alasan terbaca, contoh: %s / %s", len(out), out[0].Field, out[0].Reason)
}
