package main

import (
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/compress"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/helmet"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"

	"github.com/logikraf/logikraf-v2/internal/delivery/handler"
	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/pkg/auth"
)

var frontendDir string

func init() {
	frontendDir = os.Getenv("FRONTEND_DIR")
	if frontendDir == "" {
		if _, err := os.Stat("./frontend/dist"); err == nil {
			frontendDir = "./frontend/dist"
		} else if _, err := os.Stat("./frontend-dist"); err == nil {
			frontendDir = "./frontend-dist"
		} else {
			frontendDir = "./frontend/dist"
		}
	}
}

func main() {
	if err := model.Connect(); err != nil {
		log.Fatal(err)
	}

	app := fiber.New()
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(helmet.New())
	app.Use(compress.New())

	allowOrigins := os.Getenv("ALLOW_ORIGINS")
	if allowOrigins != "" {
		app.Use(cors.New(cors.Config{
			AllowOrigins: []string{allowOrigins},
			AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		}))
	} else {
		app.Use(cors.New())
	}

	// Rate limiters for public endpoints
	loginLimiter := limiter.New(limiter.Config{
		Max:        10,
		Expiration: 1 * time.Minute,
	})
	leadLimiter := limiter.New(limiter.Config{
		Max:        15,
		Expiration: 1 * time.Minute,
	})
	registerLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Hour,
	})

	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Public SPA routes
	app.Get("/", func(c fiber.Ctx) error {
		host := c.Hostname()
		if strings.Contains(host, ".logikraf.id") && host != "logikraf.id" && host != "www.logikraf.id" && host != "mail.logikraf.id" {
			return c.SendFile(filepath.Join(frontendDir, "index.html"))
		}
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/layanan", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/layanan/:slug", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/portfolio/:slug", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/paket", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/blog", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/blog/:slug", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/tentang-kami", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/kebijakan-privasi", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/syarat-ketentuan", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})
	app.Get("/kontak", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})

	// Static assets
	app.Get("/assets/:file", func(c fiber.Ctx) error {
		file := filepath.Join(frontendDir, "assets", c.Params("file"))
		if _, err := os.Stat(file); err != nil {
			return c.Status(404).SendString("not found")
		}
		return c.SendFile(file)
	})
	app.Get("/favicon.svg", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "favicon.svg"))
	})
	app.Get("/icons.svg", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "icons.svg"))
	})
	app.Get("/favicon.ico", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "favicon.ico"))
	})
	app.Get("/logo.png", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "logo.png"))
	})

	// Public API
	api := app.Group("/api")
	api.Get("/portfolios", handler.GetPortfolios)
	api.Get("/packages", handler.GetPackages)
	api.Post("/leads", leadLimiter, handler.CreateLead)
	api.Get("/posts", handler.GetPosts)
	api.Get("/posts/:slug", handler.GetPostBySlug)
	api.Get("/testimonials", handler.GetTestimonials)
	api.Get("/orders", auth.AuthMiddleware(), handler.GetOrders)
	api.Post("/auth/login", loginLimiter, auth.Login)
	// Client self-registration (invite-code based)
	api.Post("/client/register", registerLimiter, handler.RegisterClient)

	// Client Portal API - authenticated, client-or-admin only
	clientAPI := api.Group("/client", auth.AuthMiddleware(), auth.ClientOnly())
	clientAPI.Get("/dashboard", handler.ClientDashboard)
	clientAPI.Get("/projects", handler.ClientProjects)
	clientAPI.Get("/orders", handler.ClientOrders)
	clientAPI.Get("/invoices", handler.ClientInvoices)
	clientAPI.Get("/tickets", handler.ClientTickets)
	clientAPI.Post("/tickets", handler.CreateClientTicket)
	clientAPI.Get("/invoices/:id/pdf", handler.ClientDownloadInvoicePDF)

	// Payments + gateway webhooks (public: called by Xendit/Midtrans/iPaymu)
	api.Get("/payment-gateways", handler.GetPaymentGateways)
	api.Get("/settings/public", handler.GetPublicSettings)
	api.Post("/payment/xendit/invoice", handler.CreateXenditInvoice)
	api.Post("/payment/xendit/snap", handler.CreateXenditInvoice)
	api.Post("/payment/midtrans/snap", handler.CreateMidtransSnap)
	api.Post("/payment/midtrans/invoice", handler.CreateMidtransSnap)
	api.Post("/payment/ipaymu/snap", handler.CreateIpaymuPayment)
	api.Post("/payment/ipaymu/invoice", handler.CreateIpaymuPayment)
	api.Post("/webhooks/xendit", handler.XenditWebhook)
	api.Post("/webhooks/midtrans", handler.MidtransWebhook)
	api.Post("/webhooks/ipaymu", handler.IpaymuWebhook)
	app.Get("/sitemap.xml", handler.GetSitemap)

	// Admin API - protected
	admin := api.Group("", auth.AuthMiddleware(), auth.AdminOnly())
	admin.Get("/clients", handler.GetClients)
	admin.Post("/clients", handler.CreateClient)
	admin.Delete("/clients/:id", handler.DeleteClient)
	admin.Get("/invoices", handler.GetInvoices)
	admin.Post("/invoices", handler.CreateInvoice)
	admin.Put("/invoices/:id", handler.UpdateInvoice)
	admin.Delete("/invoices/:id", handler.DeleteInvoice)
	admin.Get("/invoices/:id/pdf", handler.DownloadInvoicePDF)
	admin.Post("/admin/force-password-reset", handler.ForcePasswordReset)
	admin.Get("/portfolios", handler.GetPortfolios)
	admin.Post("/portfolios", handler.CreatePortfolio)
	admin.Put("/portfolios/:id", handler.UpdatePortfolio)
	admin.Delete("/portfolios/:id", handler.DeletePortfolio)
	admin.Post("/upload", handler.UploadImage)
	admin.Get("/packages", handler.GetPackages)
	admin.Post("/packages", handler.CreatePackage)
	admin.Put("/packages/:id", handler.UpdatePackage)
	admin.Delete("/packages/:id", handler.DeletePackage)
	admin.Get("/templates", handler.GetTemplates)
	admin.Post("/templates", handler.CreateTemplate)
	admin.Put("/templates/:id", handler.UpdateTemplate)
	admin.Delete("/templates/:id", handler.DeleteTemplate)

	// Payment & Transaction Admin API
	admin.Get("/payment-transactions", handler.GetPaymentTransactions)
	admin.Get("/payment-transactions/summary", handler.GetPaymentSummary)
	admin.Get("/payment-transactions/ledger", handler.GetPaymentLedger)
	admin.Get("/payment-transactions/:id", handler.GetPaymentTransaction)
	admin.Post("/payment-transactions/:id/settle", handler.SettlePaymentTransaction)
	admin.Post("/payment-transactions/:id/create-client", handler.CreateClientFromPayment)
	admin.Post("/payment-transactions/:id/create-order", handler.CreateOrderFromPayment)

	admin.Post("/orders", handler.CreateOrder)
	admin.Put("/orders/:id", handler.UpdateOrder)
	admin.Delete("/orders/:id", handler.DeleteOrder)
	admin.Get("/projects", handler.GetProjects)
	admin.Get("/projects/:id", handler.GetProjectByID)
	admin.Post("/projects", handler.CreateProject)
	admin.Put("/projects/:id", handler.UpdateProject)
	admin.Delete("/projects/:id", handler.DeleteProject)
	admin.Get("/tickets", handler.GetTickets)
	admin.Post("/tickets", handler.CreateTicket)
	admin.Put("/tickets/:id", handler.UpdateTicket)
	admin.Delete("/tickets/:id", handler.DeleteTicket)
	admin.Get("/leads", handler.GetLeads)
	admin.Post("/leads", handler.CreateLead)
	admin.Put("/leads/:id", handler.UpdateLead)
	admin.Delete("/leads/:id", handler.DeleteLead)
	admin.Get("/posts", handler.GetPosts)
	admin.Post("/posts", handler.CreatePost)
	admin.Put("/posts/:id", handler.UpdatePost)
	admin.Delete("/posts/:id", handler.DeletePost)
	admin.Get("/testimonials", handler.GetTestimonials)
	admin.Post("/testimonials", handler.CreateTestimonial)
	admin.Put("/testimonials/:id", handler.UpdateTestimonial)
	admin.Delete("/testimonials/:id", handler.DeleteTestimonial)
	admin.Get("/tenant-payment-accounts", handler.ListTenantPaymentAccounts)
	admin.Get("/payment-transactions", handler.ListPaymentTransactions)
	admin.Get("/payment-reconciliation", handler.GetReconciliation)
	admin.Post("/payment-transactions/:id/refund", handler.RefundPaymentTransaction)
	admin.Get("/transactions/:id", handler.GetTransactionByID)
	admin.Get("/transactions", handler.GetTransactions)
	admin.Post("/transactions", handler.CreateTransaction)
	admin.Put("/transactions/:id", handler.UpdateTransaction)
	admin.Delete("/transactions/:id", handler.DeleteTransaction)
	admin.Get("/reports/finance", handler.GetFinanceReport)
	admin.Get("/settings", handler.ListSettings)
	admin.Get("/settings/:key", handler.GetSetting)
	admin.Put("/settings/:key", handler.SetSetting)
	admin.Get("/payment-transactions", handler.ListPaymentTransactions)

	app.Get("/*", func(c fiber.Ctx) error {
		host := c.Hostname()
		if strings.Contains(host, ".logikraf.id") && host != "logikraf.id" && host != "www.logikraf.id" && host != "mail.logikraf.id" {
			return c.SendFile(filepath.Join(frontendDir, "index.html"))
		}
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Graceful shutdown channel
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Println("Server running on :" + port)
		if err := app.Listen(":" + port); err != nil {
			log.Printf("Server listen stopped: %v\n", err)
		}
	}()

	<-quit
	log.Println("Shutting down server gracefully...")
	if err := app.Shutdown(); err != nil {
		log.Printf("Server forced shutdown error: %v\n", err)
	}
	log.Println("Server exited cleanly.")
}
