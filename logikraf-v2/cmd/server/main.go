package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/helmet"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"

	"github.com/logikraf/logikraf-v2/internal/domain/model"
	"github.com/logikraf/logikraf-v2/internal/delivery/handler"
	"github.com/logikraf/logikraf-v2/pkg/auth"
)

var frontendDir string

func init() {
	frontendDir = filepath.Join("/home/nvnrchmn/projects/LogikaKreatifIndonesia/logikraf-v2/frontend-dist")
}

func main() {
	_ = os.Setenv("DATABASE_DSN", "root:@tcp(127.0.0.1:3306)/logikraf_v2?charset=utf8mb4&parseTime=True&loc=Local")

	if err := model.Connect(); err != nil {
		log.Fatal(err)
	}

	app := fiber.New()
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(helmet.New())
	app.Use(cors.New())

	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Public SPA routes
	app.Get("/", func(c fiber.Ctx) error {
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
		return c.SendFile(filepath.Join(frontendDir, "assets", c.Params("file")))
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
	api.Get("/services", handler.GetServices)
	api.Get("/services/:slug", handler.GetServiceBySlug)
	api.Get("/portfolios", handler.GetPortfolios)
	api.Get("/packages", handler.GetPackages)
	api.Get("/leads", handler.GetLeads)
	api.Get("/posts", handler.GetPosts)
	api.Get("/posts/:slug", handler.GetPostBySlug)
	api.Get("/testimonials", handler.GetTestimonials)
	api.Get("/orders", handler.GetOrders)
	api.Get("/tickets", handler.GetTickets)
	api.Post("/auth/login", auth.Login)

	// Payments + gateway webhooks (public: called by Xendit/Midtrans)
	api.Get("/payment-gateways", handler.GetPaymentGateways)
	api.Post("/payment/xendit/invoice", handler.CreateXenditInvoice)
	api.Post("/payment/midtrans/snap", handler.CreateMidtransSnap)
	api.Post("/webhooks/xendit", handler.XenditWebhook)
	api.Post("/webhooks/midtrans", handler.MidtransWebhook)
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
	admin.Get("/services", handler.GetServices)
	admin.Post("/services", handler.CreateService)
	admin.Put("/services/:id", handler.UpdateService)
	admin.Delete("/services/:id", handler.DeleteService)
	admin.Get("/packages", handler.GetPackages)
	admin.Post("/packages", handler.CreatePackage)
	admin.Put("/packages/:id", handler.UpdatePackage)
	admin.Delete("/packages/:id", handler.DeletePackage)
	admin.Get("/orders", handler.GetOrders)
	admin.Post("/orders", handler.CreateOrder)
	admin.Put("/orders/:id", handler.UpdateOrder)
	admin.Delete("/orders/:id", handler.DeleteOrder)
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
	admin.Post("/transactions", handler.CreateTransaction)
	admin.Put("/transactions/:id", handler.UpdateTransaction)
	admin.Delete("/transactions/:id", handler.DeleteTransaction)
	admin.Get("/reports/finance", handler.GetFinanceReport)
	admin.Get("/settings", handler.ListSettings)
	admin.Get("/settings/:key", handler.GetSetting)
	admin.Put("/settings/:key", handler.SetSetting)

	// SPA fallback untuk semua route yang tidak terdaftar
	app.Get("/*", func(c fiber.Ctx) error {
		return c.SendFile(filepath.Join(frontendDir, "index.html"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server running on :" + port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
