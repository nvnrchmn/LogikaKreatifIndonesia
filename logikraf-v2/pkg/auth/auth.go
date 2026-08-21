package auth

import (
	"os"
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
	token, err := GenerateToken(user.ID, user.Role, user.Tenant)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed"})
	}
	return c.JSON(fiber.Map{"token": token, "role": user.Role, "name": user.Name})
}
