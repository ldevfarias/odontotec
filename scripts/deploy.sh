#!/bin/bash
# deploy.sh — Atualiza e reinicia todos os serviços na VPS
# Uso: bash scripts/deploy.sh

set -e

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "=== [1/4] Git pull ==="
git pull origin main

echo ""
echo "=== [2/4] Rebuild das imagens ==="
$COMPOSE build --no-cache

echo ""
echo "=== [3/4] Subindo containers ==="
$COMPOSE up -d --remove-orphans

echo ""
echo "=== [4/4] Aguardando healthchecks ==="
sleep 10
$COMPOSE ps

echo ""
echo "Deploy concluido com sucesso."
