# Panduan Deployment logikraf.id (VPS Ubuntu + Nginx + Systemd)

Dokumen ini berisi panduan konfigurasi server dan arsitektur deployment aplikasi **logikraf.id** (Go Fiber + React 19 SPA + MySQL).

---

## 1. Arsitektur Deployment

* **OS Server**: Ubuntu 22.04 / 24.04 LTS (VPS)
* **Web Server / Reverse Proxy**: Nginx (melayani file static React dari `/home/nvnrchmn/www/logikraf.id` dan proxy `/api/*` ke Go Fiber `127.0.0.1:8080`)
* **Process Manager**: Systemd service (`logikraf-api.service`)
* **CI/CD**: GitHub Actions via SSH (`.github/workflows/deploy.yml`)

---

## 2. Alur CI/CD Otomatis

Setiap kali ada commit atau push ke branch `main`, GitHub Actions akan otomatis:
1. SSH ke VPS.
2. `git pull origin main` di direktori proyek.
3. Mengompilasi frontend React: `npm ci && npm run build`.
4. Menyalin hasil build frontend (`dist/*`) ke folder web root Nginx (`/home/nvnrchmn/www/logikraf.id/`).
5. Mengompilasi binary Go: `CGO_ENABLED=0 go build -o /home/nvnrchmn/bin/logikraf-api ./cmd/server`.
6. Merestart service systemd: `sudo systemctl restart logikraf-api`.

---

## 3. Konfigurasi Service Systemd (`/etc/systemd/system/logikraf-api.service`)

```ini
[Unit]
Description=Logika Kreatif Indonesia API (Go Fiber)
After=network.target mysql.service

[Service]
Type=simple
User=nvnrchmn
WorkingDirectory=/home/nvnrchmn/deploy/logikraf/logikraf-v2
ExecStart=/home/nvnrchmn/bin/logikraf-api
Restart=always
RestartSec=5s

# Environment Variables
Environment="PORT=8080"
Environment="APP_ENV=production"
Environment="DATABASE_DSN=user:password@tcp(127.0.0.1:3306)/logikraf_v2?charset=utf8mb4&parseTime=True&loc=Local"
Environment="FRONTEND_DIR=/home/nvnrchmn/www/logikraf.id"
Environment="JWT_SECRET=your-production-jwt-secret"

[Install]
WantedBy=multi-user.target
```

---

## 4. Konfigurasi Nginx Reverse Proxy (`/etc/nginx/sites-available/logikraf.id`)

```nginx
server {
    server_name logikraf.id www.logikraf.id;
    root /home/nvnrchmn/www/logikraf.id;
    index index.html;

    # Static Assets Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # API & Webhook Reverse Proxy ke Go Fiber
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Client Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
