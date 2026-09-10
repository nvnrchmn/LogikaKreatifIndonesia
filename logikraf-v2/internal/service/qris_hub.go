package paymenthub

import "sync"

// QrisHub — pub/sub sederhana di dalam proses untuk status pembayaran QRIS.
// Dipakai endpoint SSE (/api/payment/qris/:reference/stream) supaya halaman
// bayar bisa update realtime tanpa polling.
type qrisHub struct {
	mu   sync.RWMutex
	subs map[string]map[chan string]struct{}
}

var QrisHub = &qrisHub{subs: make(map[string]map[chan string]struct{})}

// QrisSubscribe mengembalikan channel event + fungsi unsubscribe.
func QrisSubscribe(reference string) (chan string, func()) {
	ch := make(chan string, 8)
	QrisHub.mu.Lock()
	if QrisHub.subs[reference] == nil {
		QrisHub.subs[reference] = make(map[chan string]struct{})
	}
	QrisHub.subs[reference][ch] = struct{}{}
	QrisHub.mu.Unlock()

	return ch, func() {
		QrisHub.mu.Lock()
		if m := QrisHub.subs[reference]; m != nil {
			delete(m, ch)
			if len(m) == 0 {
				delete(QrisHub.subs, reference)
			}
		}
		QrisHub.mu.Unlock()
		close(ch)
	}
}

// QrisPublish mengirim payload JSON ke semua subscriber referensi tsb.
// Non-blocking: subscriber yang lambat tidak memblokir request lain.
func QrisPublish(reference, payload string) {
	QrisHub.mu.RLock()
	defer QrisHub.mu.RUnlock()
	for ch := range QrisHub.subs[reference] {
		select {
		case ch <- payload:
		default:
		}
	}
}
