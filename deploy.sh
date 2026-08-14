#!/bin/bash
cd /home/nvnrchmn/projects/LogikaKreatifIndonesia

# Pull updates
OUTPUT=$(git pull origin main 2>&1)

if [[ $OUTPUT != *"Already up to date."* && $OUTPUT != *"Fetching"* && $OUTPUT != *"fatal:"* ]]; then
    echo "Perubahan baru terdeteksi! Deploy Go Fiber..."
    
    # Install frontend deps & build
    cd frontend
    npm ci --production 2>/dev/null || npm install --production
    npm run build
    
    # Build Go binary
    cd ../backend
    CGO_ENABLED=0 GOOS=linux go build -o /home/nvnrchmn/bin/logikraf-api ./cmd/server
    
    # Restart service
    sudo systemctl restart logikraf-api
    
    echo "Deploy selesai."
else
    echo "Tidak ada perubahan."
fi