# ---- Étape de build ----
# Utilise Node.js 18 avec Alpine comme image de base pour le build
FROM node:18-alpine AS build

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN pnpm install

# Copie tout le code source
COPY . .

# Créer le fichier d'environnement de production pour la liaison backend
ARG NESTJS_API_URL
ENV NESTJS_API_URL=${NESTJS_API_URL:-https://api.nedellec-julien.fr/api}

RUN mkdir -p src/environments && \
    echo "export const environment = {" > src/environments/environment.ts && \
    echo "  production: true," >> src/environments/environment.ts && \
    echo "  apiUrl: '${NESTJS_API_URL}'," >> src/environments/environment.ts && \
    echo "};" >> src/environments/environment.ts

# Build l'application Angular en mode production
RUN pnpm run build -- --configuration production

# ---- Étape de production ----
# Utilise Nginx Alpine comme image finale légère
FROM nginx:alpine

# Crée le répertoire pour les fichiers statiques
RUN mkdir -p /usr/share/nginx/html/browser

# Copie les fichiers buildés depuis l'étape de build
COPY --from=build /app/dist/ng-portfolio-app/browser /usr/share/nginx/html/browser

# Copie la configuration Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port 80
EXPOSE 80

# Démarre Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]
