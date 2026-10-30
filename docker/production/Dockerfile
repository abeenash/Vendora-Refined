# Production image (Render, or any host that runs a container and sets $PORT).
# One container runs nginx + php-fpm + the Laravel scheduler (for the nightly demo reset).
#
#   docker build -f docker/production/Dockerfile -t vendora .
#   docker run -p 10000:10000 -e APP_KEY=... -e DB_URL=... vendora
#
# The root Dockerfile + docker-compose.yml stay the local development setup.

############################ 1. frontend assets ############################
FROM node:22-bookworm-slim AS assets
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm run build

############################ 2. PHP dependencies ###########################
FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
#extensions are checked in the runtime stage, this stage only downloads packages
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --ignore-platform-reqs

############################ 3. runtime ####################################
FROM php:8.3-fpm-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor libpq-dev gettext-base \
    && docker-php-ext-install pdo_pgsql opcache \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

RUN composer dump-autoload --optimize --no-dev --no-interaction \
    && php artisan package:discover --ansi \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/production/php.ini $PHP_INI_DIR/conf.d/zz-vendora.ini
COPY docker/production/php-fpm.conf /usr/local/etc/php-fpm.d/zz-vendora.conf
COPY docker/production/nginx.conf.template /etc/nginx/templates/vendora.conf.template
COPY docker/production/supervisord.conf /etc/supervisor/conf.d/vendora.conf
COPY docker/production/entrypoint.sh /usr/local/bin/vendora-entrypoint
RUN chmod +x /usr/local/bin/vendora-entrypoint

#Render sends traffic to $PORT (10000 by default)
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["vendora-entrypoint"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
