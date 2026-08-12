package model

import (
	"log"
	"os"

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
	return nil
}
