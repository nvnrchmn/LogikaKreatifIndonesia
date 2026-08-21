package model

import (
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3306)/logikraf_v2?charset=utf8mb4&parseTime=True&loc=Local"
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	log.Println("Database connected")

	if err := DB.AutoMigrate(
		&User{},
		&Package{},
		&Portfolio{},
		&Post{},
		&Lead{},
		&Client{},
		&Order{},
		&Project{},
		&Transaction{},
		&Invoice{},
		&Ticket{},
		&Testimonial{},
		&Setting{},
		&TenantPaymentAccount{},
		&Tenant{},
		&Plan{},
		&Entitlement{},
		&Page{},
		&Section{},
		&Media{},
	); err != nil {
		log.Printf("AutoMigrate warning: %v\n", err)
	}

	seedDefaultAdmin()
	return nil
}

// seedDefaultAdmin bootstraps an initial admin account ONLY when explicitly
// configured via ADMIN_BOOTSTRAP_EMAIL + ADMIN_BOOTSTRAP_PASSWORD (e.g. during
// first provisioning). Never seeds a hardcoded password, and never logs secrets.
func seedDefaultAdmin() {
	email := os.Getenv("ADMIN_BOOTSTRAP_EMAIL")
	password := os.Getenv("ADMIN_BOOTSTRAP_PASSWORD")
	if email == "" || password == "" {
		return
	}
	var count int64
	DB.Model(&User{}).Where("email = ?", email).Count(&count)
	if count > 0 {
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("admin bootstrap: hash failed: %v", err)
		return
	}
	admin := User{
		Name:     "Admin Logikraf",
		Email:    email,
		Password: string(hashed),
		Role:     "admin",
		Tenant:   "logikraf",
	}
	if err := DB.Create(&admin).Error; err != nil {
		log.Printf("admin bootstrap: create failed: %v", err)
		return
	}
	log.Printf("Admin bootstrap user created: %s", email)
}
