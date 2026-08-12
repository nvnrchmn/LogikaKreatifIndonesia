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
	return DB.AutoMigrate(
		&model.User{},
		&model.Service{},
		&model.Package{},
		&model.Portfolio{},
		&model.Post{},
		&model.Lead{},
		&model.Order{},
		&model.Transaction{},
		&model.Invoice{},
		&model.Ticket{},
		&model.Testimonial{},
	)
}
