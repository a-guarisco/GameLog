include .env
export

COMPOSE ?= docker compose
SERVICE ?=
SNAPSHOT_DIR ?= postgres/snapshots

.PHONY: help up down restart logs seed db-shell db-clean db-snapshot db-restore rebuild rebuild-gamelog rebuild-backend rebuild-no-cache rebuild-gamelog-no-cache rebuild-backend-no-cache

help:
	@echo "GameLog backend Docker commands"
	@echo ""
	@echo "Lifecycle:"
	@echo "  make up                  - Start all services"
	@echo "  make down                - Stop and remove containers"
	@echo "  make restart             - Restart all running services"
	@echo "  make logs                - Follow all service logs"
	@echo "  make logs SERVICE=db     - Follow logs for one service"
	@echo ""
	@echo "Rebuilds:"
	@echo "  make rebuild             - Rebuild and recreate all services"
	@echo "  make rebuild-gamelog     - Rebuild and recreate only the API"
	@echo "  make rebuild-no-cache    - Rebuild all services without cache"
	@echo "  make rebuild-gamelog-no-cache - Rebuild only the API without cache"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell            - Open a psql shell in the database container"
	@echo "  make db-clean            - Clean DB volume and recreate empty schema"
	@echo "  make db-snapshot         - Create a SQL dump of current DB state"
	@echo "  make db-restore          - Restore DB from latest snapshot"

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f $(SERVICE)

seed:
	$(COMPOSE) exec gamelog uv run python -m src.seed

db-shell:
	$(COMPOSE) exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

db-clean:
	$(COMPOSE) down -v
	$(COMPOSE) up -d db
	@sleep 2
	@echo "✅ Database cleaned and recreated"

db-snapshot:
	@mkdir -p $(SNAPSHOT_DIR)
	@ts=$$(date +%Y%m%d_%H%M%S); \
	$(COMPOSE) exec db pg_dump -U $(POSTGRES_USER) $(POSTGRES_DB) > $(SNAPSHOT_DIR)/snapshot_$$ts.sql; \
	ln -sf snapshot_$$ts.sql $(SNAPSHOT_DIR)/snapshot_latest.sql
	@echo "✅ Snapshot created and linked as snapshot_latest.sql"

db-restore:
	$(COMPOSE) down -v
	$(COMPOSE) up -d db
	@sleep 2
	$(COMPOSE) exec -T db psql -U $(POSTGRES_USER) $(POSTGRES_DB) < $(SNAPSHOT_DIR)/snapshot_latest.sql
	@echo "✅ Database restored from snapshot"

rebuild:
	$(COMPOSE) up -d --build --force-recreate

rebuild-gamelog:
	$(COMPOSE) up -d --build --force-recreate gamelog

rebuild-backend: rebuild-gamelog

rebuild-no-cache:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d --force-recreate

rebuild-gamelog-no-cache:
	$(COMPOSE) build --no-cache gamelog
	$(COMPOSE) up -d --force-recreate gamelog

rebuild-backend-no-cache: rebuild-gamelog-no-cache
