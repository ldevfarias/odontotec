#!/bin/bash
# logs.sh — Visualiza logs dos containers
# Uso: bash scripts/logs.sh [servico]
# Servicos: api | front | landing | nginx | db | all (padrão)

set -e

COMPOSE="docker compose -f docker-compose.prod.yml"
SERVICE=${1:-all}

case $SERVICE in
  api)     $COMPOSE logs -f --tail=100 api ;;
  front)   $COMPOSE logs -f --tail=100 front ;;
  landing) $COMPOSE logs -f --tail=100 landing ;;
  nginx)   $COMPOSE logs -f --tail=100 nginx ;;
  db)      $COMPOSE logs -f --tail=100 db ;;
  all)     $COMPOSE logs -f --tail=100 ;;
  *)
    echo "Servico desconhecido: $SERVICE"
    echo "Opcoes: api | front | landing | nginx | db | all"
    exit 1
    ;;
esac
