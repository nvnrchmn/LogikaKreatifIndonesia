package wa

import "testing"

func TestNormalize(t *testing.T) {
	cases := map[string]string{
		"089833342429":     "6289833342429",
		"+62 898-3342-429": "628983342429",
		"6289833342429":    "6289833342429",
		"8983342429":       "628983342429",
		"":                 "",
	}
	for in, want := range cases {
		if got := Normalize(in); got != want {
			t.Errorf("Normalize(%q) = %q, mau %q", in, got, want)
		}
	}
}
