#!/usr/bin/env bash
echo ">>> Laravel deploy script is running"

echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

echo "Building frontend..."
npm install
npm run build

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force