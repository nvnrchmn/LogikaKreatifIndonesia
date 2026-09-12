package handler

import (
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/email"
	"github.com/logikraf/logikraf-v2/pkg/invoice"
	"github.com/logikraf/logikraf-v2/pkg/wa"
)

// packageFromOrderRef — ambil paket dari nomor pesanan LK-<timestamp>-<pkgID>.
func packageFromOrderRef(ref string) (uint, string) {
	parts := strings.Split(strings.TrimSpace(ref), "-")
	if len(parts) < 3 || !strings.EqualFold(parts[0], "LK") {
		return 0, ""
	}
	id, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil || id <= 0 {
		return 0, ""
	}
	var pkg model.Package
	if err := model.DB.First(&pkg, uint(id)).Error; err != nil {
		return 0, ""
	}
	return pkg.ID, pkg.Name
}

// ensureClientForQris — cari/buat data klien dari identitas pemesan QRIS.
func ensureClientForQris(p *model.QrisPayment) uint {
	mail := strings.TrimSpace(p.ClientEmail)
	name := strings.TrimSpace(p.ClientName)
	phone := strings.TrimSpace(p.ClientPhone)
	if mail == "" {
		return 0
	}
	var client model.Client
	if err := model.DB.Where("email = ?", mail).First(&client).Error; err == nil {
		if client.InviteCode == nil || *client.InviteCode == "" {
			if code, err := generateInviteCode(); err == nil {
				client.InviteCode = &code
				model.DB.Save(&client)
			}
		}
		return client.ID
	}
	client = model.Client{PICName: name, Email: mail, Phone: phone}
	if code, err := generateInviteCode(); err == nil {
		client.InviteCode = &code
	}
	if err := model.DB.Create(&client).Error; err != nil {
		log.Printf("[qris] gagal buat klien %s: %v", mail, err)
		return 0
	}
	return client.ID
}

// orderFromQris — susun Order dari pembayaran QRIS LKI.
func orderFromQris(p *model.QrisPayment, clientID uint) model.Order {
	pkgID, pkgName := packageFromOrderRef(p.ExternalID)
	if p.PackageID > 0 {
		pkgID = p.PackageID
	}
	if p.PackageName != "" {
		pkgName = p.PackageName
	}
	name := strings.TrimSpace(p.ClientName)
	if name == "" {
		name = "Pemesan"
	}
	project := "Pesanan " + p.ExternalID
	if pkgName != "" {
		project = pkgName + " — " + name
	}
	return model.Order{
		ClientID:    clientID,
		PackageID:   pkgID,
		OrderNumber: p.ExternalID,
		ProjectName: project,
		TotalAmount: uint(p.Amount),
		Status:      "pending",
	}
}

// ensurePendingOrderForQris — buat Order sejak checkout supaya terlihat di panel.
func ensurePendingOrderForQris(p *model.QrisPayment) {
	if p == nil || p.ExternalID == "" {
		return
	}
	var order model.Order
	if model.DB.Where("order_number = ?", p.ExternalID).First(&order).Error == nil {
		return
	}
	order = orderFromQris(p, ensureClientForQris(p))
	if err := model.DB.Create(&order).Error; err != nil {
		log.Printf("[qris] gagal buat order %s: %v", p.ExternalID, err)
		return
	}
	log.Printf("[qris] order %s dibuat (pending) dari pembayaran QRIS", p.ExternalID)
}

// ensureOrderForQris — pastikan Order ada, tandai lunas, buat kwitansi, notifikasi.
func ensureOrderForQris(p *model.QrisPayment) {
	if p == nil || p.ExternalID == "" {
		return
	}
	clientID := ensureClientForQris(p)
	var order model.Order
	if err := model.DB.Where("order_number = ?", p.ExternalID).First(&order).Error; err != nil {
		order = orderFromQris(p, clientID)
		if err := model.DB.Create(&order).Error; err != nil {
			log.Printf("[qris] gagal buat order %s: %v", p.ExternalID, err)
			return
		}
		log.Printf("[qris] order %s dibuat dari pembayaran QRIS", p.ExternalID)
	} else if clientID > 0 && order.ClientID == 0 {
		order.ClientID = clientID
		model.DB.Save(&order)
	}
	if order.Status == "paid" {
		return // sudah diproses — jangan kirim notifikasi ganda
	}
	order.Status = "paid"
	if err := model.DB.Save(&order).Error; err != nil {
		log.Printf("[qris] gagal tandai lunas %s: %v", p.ExternalID, err)
		return
	}
	log.Printf("[qris] order %s ditandai PAID via QRIS", p.ExternalID)
	createReceiptForOrder(&order, p)
	notifyQrisPaid(&order, p)
}

// createReceiptForOrder — kwitansi untuk order yang sudah lunas.
func createReceiptForOrder(order *model.Order, p *model.QrisPayment) {
	now := time.Now()
	ref := p.ProviderID
	if ref == "" {
		ref = p.ReferenceID
	}
	num := "INV-" + ref
	if len(ref) >= 8 {
		num = "INV-" + ref[:8] + "-" + strconv.FormatInt(now.Unix(), 10)
	}
	inv := model.Invoice{
		OrderID:       &order.ID,
		InvoiceNumber: num,
		Type:          "receipt",
		Total:         order.TotalAmount,
		PaidAmount:    order.TotalAmount,
		PaidAt:        &now,
		Status:        "paid",
		IssueDate:     &now,
		DueDate:       &now,
	}
	if err := model.DB.Create(&inv).Error; err != nil {
		log.Printf("[qris] gagal buat invoice %s: %v", order.OrderNumber, err)
	}
}

// notifyQrisPaid — notifikasi ke klien (email+WA) dan admin setelah QRIS lunas.
func notifyQrisPaid(order *model.Order, p *model.QrisPayment) {
	amount := strconv.Itoa(p.Amount)
	cfg := email.DefaultConfig()
	if strings.TrimSpace(p.ClientEmail) != "" && cfg.Host != "" {
		to, name, ref := p.ClientEmail, p.ClientName, p.ReferenceID
		project, onum := order.ProjectName, order.OrderNumber
		pdf := invoicePDFForQris(order, p)
		go func() {
			_ = email.SendPaymentReceipt(cfg, to, name, project, amount, ref, pdf)
			_ = email.SendOrderOnboarding(cfg, to, name, onum, amount, portalInfo(to))
		}()
	}
	if strings.TrimSpace(p.ClientPhone) != "" {
		phone, onum := p.ClientPhone, order.OrderNumber
		go func() {
			_ = wa.New().Send(phone, "Terima kasih, pembayaran Anda sudah kami terima.\n"+
				"Order "+onum+"\nJumlah: Rp "+amount+"\n\n"+
				"Tim Logikraf akan menghubungi Anda untuk langkah selanjutnya."+portalInfo(p.ClientEmail))
		}()
	}
	adminMail := setting("admin_notify_email", "logikraf")
	adminWA := setting("admin_notify_wa", "logikraf")
	if cfg.Host != "" && adminMail != "" {
		onum, cname, mail, ref := order.OrderNumber, p.ClientName, p.ClientEmail, p.ReferenceID
		go func() {
			body := "<p>Pembayaran QRIS lunas &amp; pesanan dibuat otomatis.</p><ul>" +
				"<li>Order: " + onum + "</li>" +
				"<li>Klien: " + cname + " (" + mail + ")</li>" +
				"<li>Jumlah: Rp " + amount + "</li>" +
				"<li>Ref QRIS: " + ref + "</li></ul>" +
				`<p><a href="https://logikraf.id/admin/orders">Buka panel Orders</a></p>`
			_ = email.Send(cfg, []string{adminMail}, "Pesanan baru (QRIS): "+onum, body)
		}()
	}
	if adminWA != "" {
		onum, cname, ref := order.OrderNumber, p.ClientName, p.ReferenceID
		go func() {
			_ = wa.New().Send(adminWA, "Pesanan baru lunas (QRIS)\nOrder "+onum+
				"\nKlien: "+cname+"\nJumlah: Rp "+amount+"\nRef: "+ref)
		}()
	}
}

// invoicePDFForQris — PDF kwitansi untuk lampiran email.
func invoicePDFForQris(order *model.Order, p *model.QrisPayment) []byte {
	desc := order.ProjectName
	if desc == "" {
		desc = "Paket Logikraf"
	}
	pdf, err := invoice.Build(invoice.Data{
		Number:      p.ReferenceID,
		Status:      "paid",
		IssueDate:   time.Now(),
		ClientName:  p.ClientName,
		Email:       p.ClientEmail,
		Phone:       p.ClientPhone,
		Items:       []invoice.Item{{Desc: desc, Amount: uint(p.Amount)}},
		Total:       uint(p.Amount),
		Paid:        uint(p.Amount),
		Outstanding: 0,
		Notes:       "Terima kasih telah bekerja sama dengan Logikraf.",
	})
	if err != nil {
		return nil
	}
	return pdf
}
