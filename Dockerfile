
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

# Valider les variables d'environnement
RUN if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then \
    echo "Erreur: Les variables SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies"; \
    exit 1; \
  fi

# Créer le répertoire environments s'il n'existe pas
RUN mkdir -p src/environments

# Créer environment.ts par défaut s'il n'existe pas
RUN if [ ! -f "src/environments/environment.ts" ]; then \
    echo 'export const environment = {' > src/environments/environment.ts; \
    echo '  production: true,' >> src/environments/environment.ts; \
    echo '  supabaseUrl: "SUPABASE_URL_PLACEHOLDER",' >> src/environments/environment.ts; \
    echo '  supabaseKey: "SUPABASE_ANON_KEY_PLACEHOLDER",' >> src/environments/environment.ts; \
    echo '};' >> src/environments/environment.ts; \
  fi

# Créer environment.development.ts par défaut s'il n'existe pas
RUN if [ ! -f "src/environments/environment.development.ts" ]; then \
    echo 'export const environment = {' > src/environments/environment.development.ts; \
    echo '  production: false,' >> src/environments/environment.development.ts; \
    echo '  supabaseUrl: "SUPABASE_URL_PLACEHOLDER",' >> src/environments/environment.development.ts; \
    echo '  supabaseKey: "SUPABASE_ANON_KEY_PLACEHOLDER",' >> src/environments/environment.development.ts; \
    echo '};' >> src/environments/environment.development.ts; \
  fi

# Sauvegarder les fichiers avant modification
RUN cp src/environments/environment.ts src/environments/environment.ts.bak && \
    cp src/environments/environment.development.ts src/environments/environment.development.ts.bak

# Remplacer les placeholders et valeurs existantes dans environment.ts (production)
RUN sed "s|production: false|production: true|g; \
         s|SUPABASE_URL_PLACEHOLDER|${SUPABASE_URL}|g; \
         s|SUPABASE_ANON_KEY_PLACEHOLDER|${SUPABASE_ANON_KEY}|g; \
         s|process.env\['SUPABASE_URL'\] ?? \"[^\"]*\"|\"${SUPABASE_URL}\"|g; \
         s|process.env\['SUPABASE_ANON_KEY'\] ?? \"[^\"]*\"|\"${SUPABASE_ANON_KEY}\"|g; \
         s|\"https://[^\"]*\"|\"${SUPABASE_URL}\"|g; \
         s|\"eyJ[^\"]*\"|\"${SUPABASE_ANON_KEY}\"|g" \
    src/environments/environment.ts.bak > src/environments/environment.ts

# Remplacer les placeholders et valeurs existantes dans environment.development.ts
RUN sed "s|SUPABASE_URL_PLACEHOLDER|${SUPABASE_URL}|g; \
         s|SUPABASE_ANON_KEY_PLACEHOLDER|${SUPABASE_ANON_KEY}|g; \
         s|\"https://[^\"]*\"|\"${SUPABASE_URL}\"|g; \
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
