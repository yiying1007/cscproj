# 👉 第一阶段：Build 依赖
FROM composer:2.6 as vendor

WORKDIR /app

# 如果你已经有 vendor 文件夹，就复制进去
COPY composer.json composer.lock ./
COPY vendor ./vendor

# 👉 第二阶段：Build assets
FROM node:18 as assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY resources ./resources
COPY vite.config.js ./
RUN npm run build

# 👉 最终阶段：运行 Laravel
FROM php:8.2-fpm

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    unzip zip git curl libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# 安装 Laravel CLI
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# 设置工作目录
WORKDIR /var/www

# 拷贝代码
COPY . .

# 拷贝 vendor 和 build 后的资源
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

# 权限修复（避免 storage 错误）
RUN chown -R www-data:www-data /var/www && chmod -R 755 /var/www

# Laravel 最后配置命令
RUN php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && php artisan migrate --force || true

# Railway 默认监听端口为 8080
EXPOSE 8080

# 启动 Laravel 内置服务器
CMD php artisan serve --host=0.0.0.0 --port=8080
