package handler

// kycReason — satu butir alasan dari Xendit (dokumen kurang / situs belum lengkap).
type kycReason struct {
	Field   string `json:"field"`
	Reason  string `json:"reason"`
	Message string `json:"message"`
}

// collectFailureReasons — cari key "failure_reasons" di mana pun dalam payload
// Xendit, kumpulkan isinya jadi daftar alasan yang bisa dibaca mitra.
func collectFailureReasons(v any, out *[]kycReason) {
	switch t := v.(type) {
	case map[string]any:
		for k, val := range t {
			if k == "failure_reasons" {
				if arr, ok := val.([]any); ok {
					for _, it := range arr {
						if m, ok := it.(map[string]any); ok {
							r := kycReason{Field: strVal(m["field"]), Reason: strVal(m["reason"]), Message: strVal(m["message"])}
							if r.Field != "" || r.Reason != "" {
								*out = append(*out, r)
							}
						}
					}
				}
			}
			collectFailureReasons(val, out)
		}
	case []any:
		for _, it := range t {
			collectFailureReasons(it, out)
		}
	}
}
