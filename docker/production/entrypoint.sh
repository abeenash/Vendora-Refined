#!/bin/sh
# Runs once when the container starts, before nginx / php-fpm / the scheduler.
set -e
cd /var/www/html

if [ -z "$APP_KEY" ]; then
    echo "APP_KEY is not set. Generate one with: php artisan key:generate --show" >&2
    exit 1
fi

#a pasted key with a stray space, newline or terminal colour codes makes every page a 500
if ! printf '%s' "$APP_KEY" | grep -Eq '^base64:[A-Za-z0-9+/]{43}=$'; then
    echo "APP_KEY looks malformed: it must be 'base64:' followed by 44 characters, with no spaces or quotes." >&2
    exit 1
fi

#Render tells us our public URL; use it unless APP_URL was set explicitly
if [ -z "$APP_URL" ] && [ -n "$RENDER_EXTERNAL_URL" ]; then
    export APP_URL="$RENDER_EXTERNAL_URL"
fi

#nginx listens on whatever port the platform gives us
envsubst '${PORT}' < /etc/nginx/templates/vendora.conf.template > /etc/nginx/conf.d/vendora.conf

#cache config/routes/views with the real environment, then bring the schema up to date
php artisan optimize
php artisan migrate --force --no-interaction

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
