FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/odonto-front/package.json ./apps/odonto-front/
COPY apps/odonto-api/openapi.json ./apps/odonto-api/

RUN npm install --include=dev

COPY apps/odonto-front ./apps/odonto-front

WORKDIR /app/apps/odonto-front

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/apps/odonto-front/.next/standalone ./
COPY --from=builder /app/apps/odonto-front/.next/static ./apps/odonto-front/.next/static
COPY --from=builder /app/apps/odonto-front/public ./apps/odonto-front/public

ENV TZ=America/Sao_Paulo
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

EXPOSE 3001

CMD ["node", "apps/odonto-front/server.js"]
