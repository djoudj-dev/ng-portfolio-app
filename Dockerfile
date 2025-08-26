
# Multi-stage Dockerfile pour Angular avec pnpm et Nginx
FROM node:20-alpine AS builder

# Installer pnpm globalement
RUN npm install -g pnpm@9

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Variables d'environnement pour la génération des fichiers de configuration
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

# Générer les fichiers d'environnement à partir des fichiers existants
RUN if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then \
    echo "Erreur: Les variables SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies"; \
    exit 1; \
  fi

# Sauvegarder les fichiers originaux et créer les versions avec variables d'environnement
RUN cp src/environments/environment.ts src/environments/environment.ts.bak && \
    cp src/environments/environment.development.ts src/environments/environment.development.ts.bak

# Générer environment.ts pour la production
RUN sed "s|production: false|production: true|g; \
         s|process.env\['SUPABASE_URL'\] ?? \"[^\"]*\"|\"${SUPABASE_URL}\"|g; \
         s|process.env\['SUPABASE_ANON_KEY'\] ?? \"[^\"]*\"|\"${SUPABASE_ANON_KEY}\"|g; \
         s|\"https://[^\"]*\"|\"${SUPABASE_URL}\"|g; \
         s|\"eyJ[^\"]*\"|\"${SUPABASE_ANON_KEY}\"|g" \
    src/environments/environment.ts.bak > src/environments/environment.ts

# Générer environment.development.ts
RUN sed "s|\"https://[^\"]*\"|\"${SUPABASE_URL}\"|g; \
         s|\"eyJ[^\"]*\"|\"${SUPABASE_ANON_KEY}\"|g" \
    src/environments/environment.development.ts.bak > src/environments/environment.development.ts

# Nettoyer les fichiers de sauvegarde
RUN rm -f src/environments/*.bak

# Build de l'application pour la production
RUN pnpm run build

# Stage de production avec Nginx
FROM nginx:alpine AS production

# Copier la configuration Nginx personnalisée
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gérer les routes Angular (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist/ng-portfolio-app/browser /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
