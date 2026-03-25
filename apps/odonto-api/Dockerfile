FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY apps/odonto-api/package.json ./apps/odonto-api/

# Install all dependencies (including dev) from workspace root
RUN npm install --include=dev

# Copy source
COPY apps/odonto-api ./apps/odonto-api

# Build
WORKDIR /app/apps/odonto-api
RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/apps/odonto-api/dist ./dist
COPY apps/odonto-api/package.json ./

RUN npm install --omit=dev

ENV TZ=America/Sao_Paulo

EXPOSE 3000

CMD ["node", "dist/src/main"]
