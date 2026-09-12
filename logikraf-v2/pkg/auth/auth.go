package auth

import (
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
)

func getJWTSecret() []byte {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return []byte(s)
	}
	return []byte("change-me-secret-key-in-production")
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func HashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(b), err
}

func CheckPassword(password, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	Tenant string `json:"tenant"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, role, tenant string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		Tenant: tenant,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(getJWTSecret())
}

func AuthMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		h := c.Get("Authorization")
		if h == "" {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		if len(h) < 8 || h[:7] != "Bearer " {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		token, err := jwt.ParseWithClaims(h[7:], &Claims{}, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return getJWTSecret(), nil
		})
		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		c.Locals("user_id", token.Claims.(*Claims).UserID)
		c.Locals("role", token.Claims.(*Claims).Role)
		c.Locals("tenant", token.Claims.(*Claims).Tenant)
		return c.Next()
	}
}

func AdminOnly() fiber.Handler {
	return func(c fiber.Ctx) error {
		if c.Locals("role") != "admin" {
			return c.Status(403).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Next()
	}
}

// moneyPrefixes — jalur yang menyentuh uang: hanya scope "full" (pemilik).
var moneyPrefixes = []string{
	"/payment-transactions", "/transactions", "/platform-fees", "/reports/finance",
	"/client-store-settlements", "/client-stores/", "/xenplatform/accounts",
}

// systemPrefixes — konfigurasi sistem & manajemen tim: khusus pemilik.
var systemPrefixes = []string{"/settings", "/cron/jobs", "/team", "/admin/"}

// ScopeGuard membatasi modul sesuai scope akun DAN memastikan akunnya masih aktif
// pada setiap permintaan — sehingga pencabutan akses berlaku seketika, tidak perlu
// menunggu token JWT kedaluwarsa.
func ScopeGuard() fiber.Handler {
	return func(c fiber.Ctx) error {
		uid, _ := c.Locals("user_id").(uint)
		var u model.User
		if err := model.DB.Select("id", "status", "scope").First(&u, uid).Error; err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		if u.Status != "" && u.Status != "active" {
			return c.Status(403).JSON(fiber.Map{"error": "akses akun ini sudah dicabut"})
		}
		scope := u.Scope
		if scope == "" {
			scope = "full"
		}
		if scope == "full" {
			return c.Next()
		}
		p := strings.TrimPrefix(c.Path(), "/api")
		if hasAnyPrefix(p, moneyPrefixes) || hasAnyPrefix(p, systemPrefixes) {
			return c.Status(403).JSON(fiber.Map{"error": "scope " + scope + " tidak mencukupi untuk modul ini"})
		}
		return c.Next()
	}
}

func hasAnyPrefix(path string, prefixes []string) bool {
	for _, p := range prefixes {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}

// ClientOnly allows authenticated clients (and admins) to access a route.
func ClientOnly() fiber.Handler {
	return func(c fiber.Ctx) error {
		role := c.Locals("role")
		if role != "client" && role != "admin" {
			return c.Status(403).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Next()
	}
}

func Login(c fiber.Ctx) error {
	var req LoginRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid"})
	}
	var user model.User
	if err := model.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
	}
	if !CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
	}
	// Akun yang masih dalam proses undangan atau sudah dicabut tidak boleh masuk.
	if user.Status != "" && user.Status != "active" {
		return c.Status(403).JSON(fiber.Map{"error": "akses akun ini tidak aktif"})
	}
	token, err := GenerateToken(user.ID, user.Role, user.Tenant)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	scope := user.Scope
	if scope == "" {
		scope = "full"
	}
	return c.JSON(fiber.Map{"token": token, "role": user.Role, "name": user.Name, "scope": scope})
}
