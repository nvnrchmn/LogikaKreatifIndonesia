# ---- Stage 1: build Go backend ----
FROM docker.io/library/golang:1.25 AS backend
WORKDIR /src
COPY logikraf-v2/go.mod logikraf-v2/go.sum ./
RUN go mod download
COPY logikraf-v2/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/logikraf-api ./cmd/server

# ---- Stage 2: build React frontend ----
FROM docker.io/library/node:20 AS frontend
WORKDIR /fe
COPY logikraf-v2/frontend/package*.json ./
RUN npm ci
COPY logikraf-v2/frontend/ ./
RUN npm run build

# ---- Stage 3: runtime (alpine) ----
FROM docker.io/library/alpine:3.20
RUN apk add --no-cache ca-certificates wget
WORKDIR /app
COPY --from=backend /out/logikraf-api /app/logikraf-api
COPY --from=frontend /fe/dist /app/frontend/dist
EXPOSE 8080
ENV PORT=8080 \
    FRONTEND_DIR=/app/frontend/dist \
    APP_ENV=production
ENTRYPOINT ["/app/logikraf-api"]
