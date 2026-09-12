package handler

import "regexp"

// xenditAccountIDRe — pola ID akun/sub-account Xendit (ObjectId 24 hex).
var xenditAccountIDRe = regexp.MustCompile(`^[0-9a-fA-F]{24}$`)

// trustedAccountIDs — saring kandidat sub_account_id: hanya ID yang berpola Xendit.
// Payload Xendit memuat banyak string non-ID ("account.verification", nama status,
// email, hasil map), yang bila dipakai apa adanya bisa mencocokkan STORE YANG SALAH.
// Kalau tidak ada satu pun yang berpola ID, kembalikan daftar asli (jaring pengaman).
func trustedAccountIDs(cands []string) []string {
	out := make([]string, 0, len(cands))
	for _, c := range cands {
		if xenditAccountIDRe.MatchString(c) {
			out = append(out, c)
		}
	}
	if len(out) == 0 {
		return cands
	}
	return out
}
