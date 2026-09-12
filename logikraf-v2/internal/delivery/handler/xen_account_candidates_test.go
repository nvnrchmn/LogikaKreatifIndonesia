package handler

import "testing"

func TestTrustedAccountIDs(t *testing.T) {
	in := []string{
		"account.verification",
		"6a9ff4fba5931d2861ac384c",
		"AWAITING_DOCS",
		"irwansyah.terangparts@gmail.com",
		"map[created:2026-09-08T15:14:21.218Z id:6a9ff4fba5931d2861ac384c]",
	}
	out := trustedAccountIDs(in)
	if len(out) != 1 || out[0] != "6a9ff4fba5931d2861ac384c" {
		t.Fatalf("harus hanya 1 ID valid, dapat %v", out)
	}
	if got := trustedAccountIDs([]string{"account.verified"}); len(got) != 1 || got[0] != "account.verified" {
		t.Fatalf("jaring pengaman gagal (daftar mentah harus dipakai): %v", got)
	}
	t.Log("OK: hanya ID berpola 24-hex yang dipakai sebagai kandidat store")
}
