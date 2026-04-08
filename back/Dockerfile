FROM node:24-alpine AS builder
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la cache de Docker.
COPY package*.json ./
RUN npm ci

# Despues copiamos el codigo fuente y generamos la version compilada.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# En la imagen final solo dejamos las dependencias necesarias para produccion.
COPY package*.json ./
RUN npm ci --omit=dev

# Traemos unicamente el resultado compilado desde la etapa anterior.
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start"]
