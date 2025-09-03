# ---- Étape de build ----
FROM node:18-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG API_URL
ENV API_URL=${API_URL:-https://api.nedellec-julien.fr/api}

RUN mkdir -p src/environments && \
    echo "export const environment = {" > src/environments/environment.ts && \
    echo "  production: true," >> src/environments/environment.ts && \
    echo "  apiUrl: '${API_URL}'," >> src/environments/environment.ts && \
    echo "};" >> src/environments/environment.ts

RUN pnpm run build --configuration production

# ---- Étape de production ----
FROM nginx:alpine

COPY --from=build /app/dist/ng-portfolio-app/browser/ /usr/share/nginx/html/

# Configuration Nginx basique mais efficace
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
