package model

import (
	"encoding/json"
	"strings"
)

// StringList is a []string that tolerates both JSON arrays and plain
// newline-separated strings on unmarshal (used by the packages CRUD form,
// which submits features as a textarea). It always marshals back as a JSON
// array so the public API stays consistent.
type StringList []string

func (s *StringList) UnmarshalJSON(b []byte) error {
	var arr []string
	if err := json.Unmarshal(b, &arr); err == nil {
		*s = arr
		return nil
	}
	var str string
	if err := json.Unmarshal(b, &str); err != nil {
		return err
	}
	var out []string
	for _, line := range strings.Split(str, "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			out = append(out, line)
		}
	}
	*s = out
	return nil
}

func (s StringList) MarshalJSON() ([]byte, error) {
	if s == nil {
		return []byte("[]"), nil
	}
	return json.Marshal([]string(s))
}
