#!/bin/bash
cd /home/sbdigita/domains/logikraf.id/laravel_core

# Lakukan git pull dan simpan outputnya
OUTPUT=$(git pull origin main 2>&1)

# Cek apakah ada perubahan (bukan "Already up to date")
if [[ $OUTPUT != *"Already up to date."* && $OUTPUT != *"Fetching"* && $OUTPUT != *"fatal:"* ]]; then
    echo "Perubahan baru terdeteksi! Memulai deployment..."
    
    # Atur environment untuk composer
    export COMPOSER_HOME='/tmp/composer'
    
    # Install dependencies PHP
    composer install --no-interaction --prefer-dist --optimize-autoloader
    
    # Jalankan migrasi database
    php artisan migrate --force
    
    # Bersihkan cache
    php artisan optimize:clear
    
    echo "Deployment selesai."
else
    echo "Tidak ada perubahan. Melewati deployment."
fi
