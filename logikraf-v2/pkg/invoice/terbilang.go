package invoice

import "strings"

var angka = []string{"", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"}

// terbilangRek — ubah angka menjadi kata (gaya Indonesia: "seribu", "sebelas", "dua juta").
func terbilangRek(n uint64) string {
	switch {
	case n < 10:
		return angka[n]
	case n == 10:
		return "sepuluh"
	case n == 11:
		return "sebelas"
	case n < 20:
		return terbilangRek(n-10) + " belas"
	case n < 100:
		s := terbilangRek(n/10) + " puluh"
		if r := n % 10; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	case n < 200:
		s := "seratus"
		if r := n - 100; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	case n < 1_000:
		s := terbilangRek(n/100) + " ratus"
		if r := n % 100; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	case n < 2_000:
		s := "seribu"
		if r := n - 1_000; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	case n < 1_000_000:
		s := terbilangRek(n/1_000) + " ribu"
		if r := n % 1_000; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	case n < 1_000_000_000:
		s := terbilangRek(n/1_000_000) + " juta"
		if r := n % 1_000_000; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	case n < 1_000_000_000_000:
		s := terbilangRek(n/1_000_000_000) + " miliar"
		if r := n % 1_000_000_000; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	default:
		s := terbilangRek(n/1_000_000_000_000) + " triliun"
		if r := n % 1_000_000_000_000; r > 0 {
			s += " " + terbilangRek(r)
		}
		return s
	}
}

// Terbilang — jumlah uang dalam huruf, mis. "satu juta empat ratus ... rupiah".
func Terbilang(amount uint) string {
	if amount == 0 {
		return "nol rupiah"
	}
	return strings.TrimSpace(terbilangRek(uint64(amount))) + " rupiah"
}
