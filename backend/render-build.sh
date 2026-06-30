#!/usr/bin/env bash
# Script de construcción para Render.com

# Salir inmediatamente si un comando falla
set -o errexit

echo "Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader

echo "Generando key de la app..."
php artisan key:generate --force

echo "Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo "Ejecutando migraciones de la base de datos..."
php artisan migrate --force

echo "Creando enlace simbólico del storage..."
php artisan storage:link

echo "¡Construcción terminada!"
