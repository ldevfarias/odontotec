## OdontoTec – VPS Operations
## Usage: make <target>
## Run `make help` to list all commands.

COMPOSE = docker compose -f docker-compose.prod.yml

.PHONY: help deploy up down restart build logs logs-api logs-front logs-landing logs-nginx ps health pull

# ── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  OdontoTec – VPS Commands"
	@echo ""
	@echo "  Deploy"
	@echo "    make deploy          Pull + rebuild + restart tudo (zero-downtime-ish)"
	@echo "    make build           Rebuild todas as imagens sem subir"
	@echo "    make pull            Git pull do repositório"
	@echo ""
	@echo "  Containers"
	@echo "    make up              Sobe todos os containers"
	@echo "    make down            Para e remove todos os containers"
	@echo "    make restart         Restart em todos os containers"
	@echo "    make restart-nginx   Restart apenas no nginx"
	@echo "    make restart-api     Restart apenas na API"
	@echo "    make restart-front   Restart apenas no frontend"
	@echo "    make restart-landing Restart apenas na landing"
	@echo "    make ps              Lista status dos containers"
	@echo "    make health          Mostra healthcheck de cada serviço"
	@echo ""
	@echo "  Logs (Ctrl+C para sair)"
	@echo "    make logs            Todos os serviços"
	@echo "    make logs-api        API (NestJS)"
	@echo "    make logs-front      Frontend (Next.js)"
	@echo "    make logs-landing    Landing page"
	@echo "    make logs-nginx      Nginx (access + error)"
	@echo "    make logs-db         Postgres"
	@echo ""

# ── Deploy ───────────────────────────────────────────────────────────────────

deploy: pull build
	$(COMPOSE) up -d --remove-orphans
	@echo ""
	@echo "  Deploy concluido. Status:"
	@$(COMPOSE) ps

pull:
	git pull origin main

build:
	$(COMPOSE) build --no-cache

# ── Containers ───────────────────────────────────────────────────────────────

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

restart-nginx:
	$(COMPOSE) restart nginx

restart-api:
	$(COMPOSE) restart api

restart-front:
	$(COMPOSE) restart front

restart-landing:
	$(COMPOSE) restart landing

ps:
	$(COMPOSE) ps

health:
	@echo "=== Healthcheck dos containers ==="
	@docker inspect --format '{{.Name}} → {{.State.Health.Status}}' \
		$$($(COMPOSE) ps -q) 2>/dev/null || $(COMPOSE) ps

# ── Logs ─────────────────────────────────────────────────────────────────────

logs:
	$(COMPOSE) logs -f --tail=100

logs-api:
	$(COMPOSE) logs -f --tail=100 api

logs-front:
	$(COMPOSE) logs -f --tail=100 front

logs-landing:
	$(COMPOSE) logs -f --tail=100 landing

logs-nginx:
	$(COMPOSE) logs -f --tail=100 nginx

logs-db:
	$(COMPOSE) logs -f --tail=100 db
