FROM richarvey/nginx-php-fpm:1.7.2

# Set working directory
WORKDIR /var/www/html

# Copy everything into the container
COPY . .

# Set envs
ENV PHP_ERRORS_STDERR=1
ENV WEBROOT=/var/www/html/public
ENV COMPOSER_ALLOW_SUPERUSER=1

# Composer install with debug
RUN composer install --no-dev --verbose

# Laravel config caching (optional)
RUN php artisan config:cache && php artisan route:cache

# Run migrations
RUN php artisan migrate --force || true

CMD ["/start.sh"]
