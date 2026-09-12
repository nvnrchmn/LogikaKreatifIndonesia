package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"github.com/logikraf/logikraf-v2/pkg/wa"
)

// notifyClientFileUploaded — beri tahu admin (panel + email + WA) ada berkas baru dari klien.
func notifyClientFileUploaded(cl *model.Client, orig, note string) {
	company := ""
	if cl != nil {
		company = cl.CompanyName
	}
	msg := "Berkas: " + orig + " | Klien: " + company
	if note != "" {
		msg += " | Catatan: " + note
	}
	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "client_file_uploaded",
		Title:    "Berkas baru dari klien",
		Message:  msg,
	})
	if to := setting("admin_notify_email", "logikraf"); to != "" {
		if cfg := email.DefaultConfig(); cfg.Host != "" {
			go func() {
				_ = email.Send(cfg, []string{to}, "Berkas baru dari klien: "+orig, "<p>"+msg+"</p>")
			}()
		}
	}
	if num := setting("admin_notify_wa", "logikraf"); num != "" {
		go func() { _ = wa.New().Send(num, "Berkas baru dari klien\n"+msg) }()
	}
}
