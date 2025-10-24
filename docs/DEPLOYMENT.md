# Guide de Déploiement - ImmoConnect

## Prérequis

- Node.js 18+
- PostgreSQL 13+
- Redis (optionnel, pour les sessions)
- Serveur web (Nginx recommandé)
- SSL Certificate (Let's Encrypt recommandé)

## Variables d'Environnement

### Backend (.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/immoconnect

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@immoconnect.com
FROM_NAME=ImmoConnect

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (pour les sessions et cache)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com

# Socket.IO
SOCKET_CORS_ORIGIN=https://yourdomain.com

# App Configuration
APP_NAME=ImmoConnect
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Frontend (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backend API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com

# Mapbox (pour la géolocalisation)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# App Configuration
NEXT_PUBLIC_APP_NAME=ImmoConnect
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Déploiement Backend

### 1. Préparation du serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib

# Installer Redis (optionnel)
sudo apt install redis-server

# Installer Nginx
sudo apt install nginx

# Installer PM2
sudo npm install -g pm2
```

### 2. Configuration de la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE immoconnect;
CREATE USER immoconnect_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE immoconnect TO immoconnect_user;
\q
```

### 3. Déploiement de l'application

```bash
# Cloner le repository
git clone https://github.com/yourusername/immoconnect.git
cd immoconnect

# Installer les dépendances
npm run install:all

# Configurer les variables d'environnement
cp backend/env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Générer le client Prisma
cd backend
npm run db:generate

# Exécuter les migrations
npm run db:push

# Build de l'application
npm run build

# Démarrer avec PM2
pm2 start dist/server.js --name immoconnect-api
pm2 save
pm2 startup
```

## Déploiement Frontend

### 1. Build de l'application

```bash
cd frontend

# Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec vos valeurs

# Installer les dépendances
npm install

# Build de l'application
npm run build
```

### 2. Déploiement avec Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 3. Déploiement avec Nginx

```bash
# Copier les fichiers buildés
sudo cp -r frontend/out/* /var/www/html/

# Configurer Nginx
sudo nano /etc/nginx/sites-available/immoconnect
```

Configuration Nginx :
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

## Configuration PM2

Créer `ecosystem.config.js` :
```javascript
module.exports = {
  apps: [{
    name: 'immoconnect-api',
    script: 'dist/server.js',
    cwd: '/path/to/immoconnect/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## Monitoring et Logs

### 1. Configuration des logs

```bash
# Créer le répertoire des logs
mkdir -p /var/log/immoconnect

# Configurer logrotate
sudo nano /etc/logrotate.d/immoconnect
```

Configuration logrotate :
```
/var/log/immoconnect/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 immoconnect immoconnect
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Monitoring avec PM2

```bash
# Voir les processus
pm2 list

# Voir les logs
pm2 logs immoconnect-api

# Monitoring en temps réel
pm2 monit

# Redémarrer l'application
pm2 restart immoconnect-api
```

## Sauvegarde de la base de données

```bash
# Script de sauvegarde quotidienne
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U immoconnect_user immoconnect > /backups/immoconnect_$DATE.sql
gzip /backups/immoconnect_$DATE.sql

# Garder seulement les 30 derniers jours
find /backups -name "immoconnect_*.sql.gz" -mtime +30 -delete
```

## Mise à jour de l'application

```bash
# Arrêter l'application
pm2 stop immoconnect-api

# Mettre à jour le code
git pull origin main

# Installer les nouvelles dépendances
npm run install:all

# Exécuter les migrations
cd backend
npm run db:push

# Rebuild l'application
npm run build

# Redémarrer l'application
pm2 start immoconnect-api
```

## Sécurité

### 1. Configuration du firewall

```bash
# Autoriser seulement les ports nécessaires
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. Configuration PostgreSQL

```bash
# Éditer postgresql.conf
sudo nano /etc/postgresql/13/main/postgresql.conf

# Éditer pg_hba.conf
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

### 3. Configuration Nginx

```nginx
# Ajouter des headers de sécurité
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Tests de charge

```bash
# Installer Apache Bench
sudo apt install apache2-utils

# Test de charge sur l'API
ab -n 1000 -c 10 http://localhost:5000/api/health

# Test de charge sur le frontend
ab -n 1000 -c 10 http://localhost:3000/
```

## Dépannage

### 1. Vérifier les logs

```bash
# Logs de l'application
pm2 logs immoconnect-api

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

### 2. Vérifier les processus

```bash
# Vérifier PM2
pm2 status

# Vérifier les ports
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 3. Vérifier la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql -d immoconnect

# Vérifier les tables
\dt

# Vérifier les connexions
SELECT * FROM pg_stat_activity;
```
