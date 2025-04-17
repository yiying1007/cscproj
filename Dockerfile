FROM php:8.1-fpm

RUN apt-get update && apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev zip git libicu-dev libxml2-dev
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd pdo pdo_mysql intl xml opcache


RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer


WORKDIR /var/www

COPY . .


RUN composer install --optimize-autoloader --no-dev


RUN npm install
RUN npm run build


EXPOSE 9000


CMD ["php-fpm"]
