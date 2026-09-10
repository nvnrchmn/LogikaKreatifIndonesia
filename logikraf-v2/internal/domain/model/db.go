package model

import (
	"encoding/json"
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
		&HeroStat{},
		&ProjectTemplate{},
		&Plan{},
		&Entitlement{},
		&Page{},
		&Section{},
		&Media{},
		&ClientStore{},
		&PartnerUser{},
		&QrisPayment{},
	); err != nil {
		log.Printf("AutoMigrate warning: %v\n", err)
	}

	seedDefaultAdmin()
	seedClientStoresFromEnv()
	return nil
}

// seedClientStoresFromEnv migrates stores configured via environment
// (CLIENT_STORES JSON or MG_INTERNAL_URL/KEY) into the client_stores table the
// first time the table is empty. After that, management happens via the UI.
func seedClientStoresFromEnv() {
	var count int64
	DB.Model(&ClientStore{}).Count(&count)
	if count > 0 {
		return
	}
	var stores []ClientStore
	raw := os.Getenv("CLIENT_STORES")
	if raw != "" {
		var env []struct {
			Slug    string `json:"slug"`
			Name    string `json:"name"`
			BaseURL string `json:"base_url"`
		}
		if err := json.Unmarshal([]byte(raw), &env); err == nil {
			for _, e := range env {
				stores = append(stores, ClientStore{Slug: e.Slug, Name: e.Name, BaseURL: e.BaseURL, IsActive: true})
			}
		}
	}
	if len(stores) == 0 {
		if u := os.Getenv("MG_INTERNAL_URL"); u != "" {
			stores = append(stores, ClientStore{
				Slug: "mysticglide", Name: "Mystic Glide", BaseURL: u, IsActive: true,
			})
		}
	}
	key := os.Getenv("MG_INTERNAL_KEY")
	for i := range stores {
		if stores[i].Slug == "" || stores[i].Name == "" || stores[i].BaseURL == "" {
			continue
		}
		stores[i].InternalKey = key
		if err := DB.Create(&stores[i]).Error; err != nil {
			log.Printf("seed client_store: %v", err)
		} else {
			log.Printf("seed client_store: %s (%s) dari env", stores[i].Name, stores[i].Slug)
		}
	}
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
