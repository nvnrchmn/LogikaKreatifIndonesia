package handler

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"github.com/logikraf/logikraf-v2/pkg/wa"
)

var (
	errReplyInvalid = errors.New("format balasan tidak valid")
	errReplyEmpty   = errors.New("balasan tidak boleh kosong")
	errReplyTooLong = errors.New("balasan terlalu panjang (maks 5000 karakter)")
)

// clip — potong teks untuk ringkasan notifikasi.
func clip(s string, n int) string {
	r := []rune(strings.TrimSpace(s))
	if len(r) <= n {
		return string(r)
	}
	return string(r[:n]) + "…"
}

// ticketForUser — tiket milik user tertentu (mencegah akses lintas akun).
func ticketForUser(id, uid uint) (*model.Ticket, error) {
	var t model.Ticket
	if err := model.DB.Where("id = ? AND user_id = ?", id, uid).First(&t).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

// ticketReplies — percakapan tiket, urut lama ke baru.
func ticketReplies(tid uint) []model.TicketReply {
	rows := []model.TicketReply{}
	model.DB.Where("ticket_id = ?", tid).Order("created_at asc, id asc").Find(&rows)
	return rows
}

// readReplyBody — validasi isi balasan dari body JSON.
func readReplyBody(c fiber.Ctx) (string, error) {
	var in struct {
		Body string `json:"body"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return "", errReplyInvalid
	}
	body := strings.TrimSpace(in.Body)
	if body == "" {
		return "", errReplyEmpty
	}
	if len([]rune(body)) > 5000 {
		return "", errReplyTooLong
	}
	return body, nil
}

// ClientTicket — detail tiket + percakapan (klien hanya tiketnya sendiri).
func ClientTicket(c fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "id tiket tidak valid"})
	}
	t, err := ticketForUser(uint(id), uid)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"ticket": t, "replies": ticketReplies(t.ID)})
}

// ReplyClientTicket — klien membalas tiketnya sendiri.
func ReplyClientTicket(c fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "id tiket tidak valid"})
	}
	body, err := readReplyBody(c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	t, err := ticketForUser(uint(id), uid)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}
	var u model.User
	model.DB.First(&u, uid)
	r := model.TicketReply{TicketID: t.ID, UserID: uid, Author: "client", AuthorName: pickName(u.Name, u.Email), Body: body}
	if err := model.DB.Create(&r).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan balasan"})
	}
	// Tiket yang sudah selesai/tutup otomatis dibuka lagi saat klien membalas.
	if t.Status == "closed" || t.Status == "resolved" {
		model.DB.Model(&model.Ticket{}).Where("id = ?", t.ID).Update("status", "open")
	}
	go notifyTicketReplyFromClient(*t, r)
	return c.Status(201).JSON(r)
}

// AdminTickets — daftar tiket untuk panel (terbaru dulu) + hitungan balasan.
func AdminTickets(c fiber.Ctx) error {
	q := strings.ToLower(strings.TrimSpace(c.Query("q")))
	rows := []model.Ticket{}
	model.DB.Order("updated_at desc, id desc").Limit(200).Find(&rows)

	users := map[uint]model.User{}
	var us []model.User
	model.DB.Find(&us)
	for _, u := range us {
		users[u.ID] = u
	}
	type agg struct {
		TicketID uint
		N        int
	}
	var cs []agg
	model.DB.Model(&model.TicketReply{}).Select("ticket_id, count(*) as n").Group("ticket_id").Scan(&cs)
	counts := map[uint]int{}
	for _, x := range cs {
		counts[x.TicketID] = x.N
	}

	out := []fiber.Map{}
	for _, t := range rows {
		u := users[t.UserID]
		if q != "" && !strings.Contains(strings.ToLower(t.Subject+" "+u.Name+" "+u.Email), q) {
			continue
		}
		out = append(out, fiber.Map{
			"id":          t.ID,
			"subject":     t.Subject,
			"description": t.Description,
			"priority":    t.Priority,
			"status":      t.Status,
			"order_id":    t.OrderID,
			"user_name":   u.Name,
			"user_email":  u.Email,
			"reply_count": counts[t.ID],
			"created_at":  t.CreatedAt.Format("2006-01-02 15:04"),
			"updated_at":  t.UpdatedAt.Format("2006-01-02 15:04"),
		})
	}
	return c.JSON(fiber.Map{"tickets": out, "total": len(out)})
}

// AdminTicket — detail tiket + percakapan (admin melihat semua tiket).
func AdminTicket(c fiber.Ctx) error {
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "id tiket tidak valid"})
	}
	var t model.Ticket
	if err := model.DB.First(&t, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}
	var u model.User
	model.DB.First(&u, t.UserID)
	return c.JSON(fiber.Map{
		"ticket":  t,
		"user":    fiber.Map{"name": u.Name, "email": u.Email},
		"replies": ticketReplies(t.ID),
	})
}

// AdminReplyTicket — admin membalas tiket; klien diberi tahu lewat email + WA.
func AdminReplyTicket(c fiber.Ctx) error {
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "id tiket tidak valid"})
	}
	body, err := readReplyBody(c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var t model.Ticket
	if err := model.DB.First(&t, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}
	r := model.TicketReply{TicketID: t.ID, Author: "admin", AuthorName: "Tim Logikraf", Body: body}
	if err := model.DB.Create(&r).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan balasan"})
	}
	go notifyTicketReplyToClient(t, body)
	return c.Status(201).JSON(r)
}

// AdminTicketStatus — ubah status tiket dari panel.
func AdminTicketStatus(c fiber.Ctx) error {
	id, err := strconv.Atoi(strings.TrimSpace(c.Params("id")))
	if err != nil || id <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "id tiket tidak valid"})
	}
	var in struct {
		Status string `json:"status"`
	}
	if err := c.Bind().JSON(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "format tidak valid"})
	}
	if !map[string]bool{"open": true, "pending": true, "resolved": true, "closed": true}[in.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "status tidak dikenali"})
	}
	if err := model.DB.Model(&model.Ticket{}).Where("id = ?", id).Update("status", in.Status).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "gagal menyimpan status"})
	}
	return c.JSON(fiber.Map{"ok": true})
}

// notifyTicketReplyFromClient — beri tahu admin (panel + email + WA).
func notifyTicketReplyFromClient(t model.Ticket, r model.TicketReply) {
	msg := "Tiket #" + strconv.Itoa(int(t.ID)) + " — " + t.Subject + " | " + r.AuthorName + ": " + clip(r.Body, 160)
	model.DB.Create(&model.Notification{
		TenantID: "logikraf",
		Type:     "ticket_reply",
		Title:    "Balasan tiket dari klien",
		Message:  msg,
		RefTable: "tickets",
		RefID:    t.ID,
	})
	if to := setting("admin_notify_email", "logikraf"); to != "" {
		if cfg := email.DefaultConfig(); cfg.Host != "" {
			go func() { _ = email.Send(cfg, []string{to}, "Balasan tiket: "+t.Subject, "<p>"+msg+"</p>") }()
		}
	}
	if num := setting("admin_notify_wa", "logikraf"); num != "" {
		go func() { _ = wa.New().Send(num, "Balasan tiket dari klien\n"+msg) }()
	}
}

// notifyTicketReplyToClient — kabari klien (email + WA) saat admin membalas.
func notifyTicketReplyToClient(t model.Ticket, body string) {
	var u model.User
	if err := model.DB.First(&u, t.UserID).Error; err != nil {
		return
	}
	link := portalURL("/tickets/" + strconv.Itoa(int(t.ID)))
	if cfg := email.DefaultConfig(); cfg.Host != "" && u.Email != "" {
		html := "<p>Halo " + u.Name + ", ada balasan untuk tiket Anda:</p><blockquote>" + clip(body, 800) +
			"</blockquote><p><a href=\"" + link + "\">Buka percakapan di portal</a></p>"
		go func() { _ = email.Send(cfg, []string{u.Email}, "Balasan tiket: "+t.Subject, html) }()
	}
	var cl model.Client
	if err := model.DB.Where("email = ?", u.Email).First(&cl).Error; err == nil && cl.Phone != "" {
		msg := "Balasan tiket \"" + t.Subject + "\":\n" + clip(body, 300) + "\n\nBuka: " + link
		go func() { _ = wa.New().Send(cl.Phone, msg) }()
	}
}
