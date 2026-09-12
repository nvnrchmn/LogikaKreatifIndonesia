package database

import (
	"fmt"
	"log"
	"os"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	log.Println("Database connected")
	return nil
}

func AutoMigrate() error {
	if err := DB.AutoMigrate(
		&model.User{},
		&model.Package{},
		&model.Portfolio{},
		&model.Post{},
		&model.Lead{},
		&model.Order{},
		&model.Transaction{},
		&model.Invoice{},
		&model.Ticket{},
		&model.Testimonial{},
		&model.QrisPayment{},
	); err != nil {
		return err
	}
	// Backfill invoices.paid_at untuk invoice lama yang sudah lunas — kolom ini baru
	// ditambahkan 12 Sep 2026, dan tanpanya PDF invoice lama tetap menampilkan
	// "Jatuh tempo" padahal uangnya sudah diterima. Untuk invoice bertipe receipt,
	// tanggal terbit = saat pembayaran masuk, jadi itu nilai terbaik yang tersedia.
	// Idempoten: hanya menyentuh baris yang kolomnya masih NULL.
	return DB.Exec(
		"UPDATE invoices SET paid_at = COALESCE(issue_date, created_at) " +
			"WHERE paid_at IS NULL AND total > 0 AND paid_amount >= total " +
			"AND status IN ('paid', 'settled')",
	).Error
}
