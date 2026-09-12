package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/logikraf/logikraf-v2/internal/delivery/handler"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

// Rekonsiliasi pembayaran QRIS -> Order + kwitansi + notifikasi.
// Pemakaian:  reconcile-qris [reference_id]     (tanpa argumen = semua yang lunas)
func main() {
	if err := model.Connect(); err != nil {
		log.Fatalf("gagal konek DB: %v", err)
	}
	ref := ""
	if len(os.Args) > 1 {
		ref = os.Args[1]
	}
	rows, err := handler.ReconcileQrisPaid(ref)
	if err != nil {
		log.Fatalf("rekonsiliasi gagal: %v", err)
	}
	for _, r := range rows {
		fmt.Println("  ", r)
	}
	fmt.Println("selesai:", len(rows), "pembayaran diproses")

	// Notifikasi dikirim asinkron oleh handler; beri waktu supaya tidak ikut
	// mati saat proses ini keluar.
	time.Sleep(20 * time.Second)
}
