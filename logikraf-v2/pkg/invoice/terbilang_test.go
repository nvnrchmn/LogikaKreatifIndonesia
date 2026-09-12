package invoice

import "testing"

func TestTerbilang(t *testing.T) {
	cases := map[uint]string{
		0:       "nol rupiah",
		7:       "tujuh rupiah",
		11:      "sebelas rupiah",
		20:      "dua puluh rupiah",
		100:     "seratus rupiah",
		1500:    "seribu lima ratus rupiah",
		1499000: "satu juta empat ratus sembilan puluh sembilan ribu rupiah",
	}
	for in, want := range cases {
		if got := Terbilang(in); got != want {
			t.Fatalf("Terbilang(%d) = %q, ingin %q", in, got, want)
		}
	}
}

func TestTerbilangMiliar(t *testing.T) {
	if got, want := Terbilang(2500000000), "dua miliar lima ratus juta rupiah"; got != want {
		t.Fatalf("got %q ingin %q", got, want)
	}
}
