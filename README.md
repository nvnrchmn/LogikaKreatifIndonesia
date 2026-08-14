# Logika Kreatif Indonesia (logikraf.id)

Platform digital resmi **PT. Logika Kreatif Indonesia** — Digital Creative Agency & Software House.

---

## 🚀 Tech Stack

* **Backend**: Golang (Go 1.25+), [GoFiber v3](https://gofiber.io), [GORM](https://gorm.io) (MySQL/SQLite), JWT Authentication.
* **Frontend**: React 19, TypeScript, [Vite](https://vitejs.dev), [Ant Design](https://ant.design), [Tailwind CSS v4](https://tailwindcss.com), TanStack Query.
* **Deployment & CI/CD**: GitHub Actions via SSH ke VPS (Systemd service `logikraf-api`).

---

## 📁 Struktur Direktori

```
LogikaKreatifIndonesia/
├── .github/workflows/       # GitHub Actions CI/CD (deploy.yml)
├── docs/                    # Architecture Blueprint, ADR, & Dokumentasi Bisnis
├── logikraf-v2/
│   ├── cmd/server/          # Entry point server Go (main.go)
│   ├── frontend/            # Aplikasi React 19 + TypeScript + Vite
│   ├── internal/
│   │   ├── delivery/        # HTTP Handlers (Fiber API & SPA routes)
│   │   ├── domain/          # Model Eloquent/GORM & Entity Definition
│   │   └── infrastructure/  # Database initialization & config
│   ├── migrations/          # SQL Migration schemas & seeders
│   ├── pkg/                 # Package utilities (auth/jwt, etc.)
│   ├── go.mod               # Go dependencies
│   └── .env.example         # Environment template
└── .env.example             # Root environment template
```

---

## 🛠️ Panduan Menjalankan Lokal

### 1. Backend (Go)
```bash
cd logikraf-v2

# Setup Environment
cp .env.example .env

# Jalankan Server
go run ./cmd/server
```

### 2. Frontend (React + Vite)
```bash
cd logikraf-v2/frontend

# Install Dependencies
npm install

# Jalankan Dev Server
npm run dev

# Build Production
npm run build
```

---

## 🚢 Deployment (CI/CD)

Deployment berjalan otomatis via GitHub Actions pada branch `main` ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).
* **Build Frontend**: `npm ci && npm run build` -> disalin ke web root Nginx.
* **Build Backend**: `CGO_ENABLED=0 go build -o /home/nvnrchmn/bin/logikraf-api ./cmd/server` -> restart systemd service `logikraf-api`.
