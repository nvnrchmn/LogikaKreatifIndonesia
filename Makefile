.PHONY: all dev build test clean frontend-build backend-build

all: build

# Jalankan backend Go
backend-dev:
	cd logikraf-v2 && go run ./cmd/server

# Jalankan frontend Vite
frontend-dev:
	cd logikraf-v2/frontend && npm run dev

# Jalankan test backend
test:
	cd logikraf-v2 && go test ./internal/...

# Build seluruh aplikasi (Frontend + Go Binary)
build: frontend-build backend-build

frontend-build:
	cd logikraf-v2/frontend && npm ci && npm run build

backend-build:
	cd logikraf-v2 && go build -o bin/logikraf-api ./cmd/server

# Bersihkan build artifacts
clean:
	rm -rf logikraf-v2/bin logikraf-v2/frontend/dist
