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
		&Service{},
		&Package{},
		&Portfolio{},
		&Post{},
		&Lead{},
		&Order{},
		&Transaction{},
		&Invoice{},
		&Ticket{},
		&Testimonial{},
		&Setting{},
		&TenantPaymentAccount{},
	); err != nil {
		log.Printf("AutoMigrate warning: %v\n", err)
	}

	seedDefaultAdmin()
	return nil
}

func seedDefaultAdmin() {
	var count int64
	DB.Model(&User{}).Where("email = ?", "admin@logikraf.id").Count(&count)
	if count == 0 {
		hashed, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err == nil {
			admin := User{
				Name:     "Admin Logikraf",
				Email:    "admin@logikraf.id",
				Password: string(hashed),
				Role:     "admin",
				Tenant:   "logikraf",
			}
			if err := DB.Create(&admin).Error; err == nil {
				log.Println("Default admin user seeded: admin@logikraf.id / admin123")
			}
		}
	}
}
