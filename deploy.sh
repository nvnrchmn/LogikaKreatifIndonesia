#!/bin/bash
cd /home/sbdigita/domains/logikraf.id/laravel_core

# Tarik kode terbaru dari GitHub
git pull origin main

# Atur environment untuk composer agar tidak error permission
export COMPOSER_HOME='/tmp/composer'

# Install dependencies PHP
composer install --no-interaction --prefer-dist --optimize-autoloader

# Jalankan migrasi database
php artisan migrate --force

# Bersihkan cache Laravel
php artisan optimize:clear
