FROM node:24-alpine AS builder
WORKDIR /app

# Instalamos dependencias y luego construimos el frontend.
COPY package*.json ./
RUN npm ci

COPY index.html ./
COPY vite.config.js ./
COPY src ./src
RUN npm run build

FROM nginx:1.29-alpine AS runner
# Reemplazamos la configuracion por defecto de Nginx con una propia.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estaticos generados por Vite.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
