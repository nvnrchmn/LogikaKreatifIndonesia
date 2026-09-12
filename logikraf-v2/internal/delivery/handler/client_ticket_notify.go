package handler

import (
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"github.com/logikraf/logikraf-v2/pkg/wa"
)

// notifyTicketCreated — beri tahu admin (panel + email + WA) saat klien membuka tiket.
func notifyTicketCreated(t model.Ticket, cl *model.Client) {
	company := ""
	if cl != nil {
		company = cl.CompanyName
	}
	msg := "Subjek: " + t.Subject + " | Prioritas: " + t.Priority + " | Klien: " + company
	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "ticket_created",
		Title:    "Tiket baru dari klien",
		Message:  msg,
		RefTable: "tickets",
		RefID:    t.ID,
	})
	if to := setting("admin_notify_email", "logikraf"); to != "" {
		if cfg := email.DefaultConfig(); cfg.Host != "" {
			go func() {
				_ = email.Send(cfg, []string{to}, "Tiket baru: "+t.Subject,
					"<p>Tiket baru dari portal klien.</p><p>"+msg+"</p>")
			}()
		}
	}
	if num := setting("admin_notify_wa", "logikraf"); num != "" {
		go func() { _ = wa.New().Send(num, "Tiket baru dari klien\n"+msg) }()
	}
}
