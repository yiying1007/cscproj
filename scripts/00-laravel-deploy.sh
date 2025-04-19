#!/usr/bin/env bash
 set -e
 echo "Running composer"
 composer global require hirak/prestissimo
 composer install --no-dev --working-dir=/var/www/html
 
 echo "Caching config..."
 php artisan config:cache
 
 echo "Caching routes..."
 php artisan route:cache
 
 echo "Running migrations..."
 php artisan migrate --force

 echo "Building frontend assets..."
 npm install
 npm run build
 
 echo "Checking Laravel logs if any errors..."
 cat storage/logs/laravel.log || echo "No Laravel error logs found."