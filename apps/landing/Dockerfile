FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/landing/package.json ./apps/landing/

RUN npm install --include=dev

COPY apps/landing ./apps/landing

WORKDIR /app/apps/landing

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/apps/landing/.next/standalone ./
COPY --from=builder /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder /app/apps/landing/public ./apps/landing/public

ENV TZ=America/Sao_Paulo
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

EXPOSE 3002

CMD ["node", "apps/landing/server.js"]
