FROM php:8.2-apache

# Instalar dependencias del sistema y extensiones de PHP (incluyendo PostgreSQL)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip gd

# Habilitar mod_rewrite de Apache para Laravel
RUN a2enmod rewrite

# Configurar Apache para que apunte a la carpeta 'public' de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias de Laravel
RUN composer install --no-dev --optimize-autoloader

# Dar permisos a las carpetas storage y cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exponer el puerto 80 (Render lo detectará automáticamente)
EXPOSE 80

# Script de inicio: crear link de storage, generar .env de forma segura, correr migraciones e iniciar Apache
RUN echo '#!/bin/bash\necho "APP_NAME=\"\${APP_NAME}\"" > /var/www/html/.env\necho "APP_ENV=\${APP_ENV}" >> /var/www/html/.env\necho "APP_KEY=\"\${APP_KEY}\"" >> /var/www/html/.env\necho "APP_DEBUG=\${APP_DEBUG}" >> /var/www/html/.env\necho "APP_URL=\${APP_URL}" >> /var/www/html/.env\necho "DB_CONNECTION=\${DB_CONNECTION}" >> /var/www/html/.env\necho "DB_URL=\"\${DATABASE_URL}\"" >> /var/www/html/.env\nphp artisan storage:link\nphp artisan migrate --force\nchown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/.env\napache2-foreground' > /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
