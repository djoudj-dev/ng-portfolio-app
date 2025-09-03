# ---- Étape de build ----
# Utilise Node.js 18 avec Alpine comme image de base pour le build
FROM node:18-alpine AS build

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Installer pnpm globalement
RUN npm install -g pnpm

# Copie les fichiers package.json et pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml* ./

# Installe les dépendances
RUN pnpm install --frozen-lockfile

# Copie tout le code source
COPY . .

# Créer le fichier d'environnement de production pour la liaison backend
ARG API_URL
ENV API_URL=${API_URL:-https://api.nedellec-julien.fr/api}

RUN mkdir -p src/environments && \
    echo "export const environment = {" > src/environments/environment.ts && \
    echo "  production: true," >> src/environments/environment.ts && \
    echo "  apiUrl: '${API_URL}'," >> src/environments/environment.ts && \
    echo "};" >> src/environments/environment.ts

# Build l'application Angular en mode production
RUN pnpm run build --configuration production

# ---- Étape de production ----
# Utilise Nginx Alpine comme image finale légère
FROM nginx:alpine

# Copie les fichiers buildés depuis l'étape de build
COPY --from=build /app/dist/ng-portfolio-app/browser/ /usr/share/nginx/html/

# Configuration Nginx par défaut pour Angular SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Gestion des fichiers statiques avec cache \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose le port 80
EXPOSE 80

# Démarre Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]
