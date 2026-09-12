package auth

import (
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"gorm.io/gorm"
)

// TestKirimVerifikasiEmail — membuktikan SendEmailVerification membuat token
// verifikasi untuk klien yang punya nomor telepon (jalur WA ikut dieksekusi).
func TestKirimVerifikasiEmail(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:waverif?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("buka db: %v", err)
	}
	if err := db.AutoMigrate(&model.User{}, &model.Client{}, &model.EmailVerification{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	prev := model.DB
	model.DB = db
	t.Cleanup(func() { model.DB = prev })

	u := model.User{Name: "Uji Verifikasi", Email: "wa-uji@logikraf.local"}
	if err := db.Create(&u).Error; err != nil {
		t.Fatalf("user: %v", err)
	}
	cl := model.Client{CompanyName: "Uji", Email: u.Email, Phone: "628983342429"}
	if err := db.Create(&cl).Error; err != nil {
		t.Fatalf("client: %v", err)
	}

	SendEmailVerification(u)
	time.Sleep(3 * time.Second)

	var n int64
	db.Model(&model.EmailVerification{}).Where("email = ?", u.Email).Count(&n)
	if n != 1 {
		t.Fatalf("token verifikasi harus 1, dapat %d", n)
	}
	t.Log("token verifikasi dibuat & jalur pengingat WA dieksekusi tanpa panic")
}
