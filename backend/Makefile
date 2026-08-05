include .env
export

COMPOSE ?= docker compose
SERVICE ?=
SNAPSHOT_DIR ?= postgres/snapshots
RUN_SCHEDULER ?= false

ifneq ($(filter prod,$(MAKECMDGOALS)),)
  RUN_SCHEDULER = true
endif

export RUN_SCHEDULER

.PHONY: help prod down restart logs rebuild rebuild-gamelog rebuild-backend rebuild-no-cache rebuild-gamelog-no-cache rebuild-backend-no-cache setup db-reset db-fresh-baseline migrate revision downgrade seed seed-firebase test test-local lint db-shell db-clean db-snapshot db-restore

prod:
	@:

help:
	@echo "GameLog backend Docker commands"
	@echo ""
	@echo "Testing & Code Quality:"
	@echo "  make test                - Run pytest test suite in Docker container"
	@echo "  make test-local          - Run pytest test suite locally on host"
	@echo "  make lint                - Run ruff linter and code formatter on local files"
	@echo ""
	@echo "Lifecycle:"
	@echo "  make up                  - Start all services with background scheduler disabled (RUN_SCHEDULER=false)"
	@echo "  make up prod             - Start all services with background scheduler enabled (RUN_SCHEDULER=true)"
	@echo "  make down                - Stop and remove containers"
	@echo "  make restart             - Restart all running services"
	@echo "  make logs                - Follow all service logs"
	@echo "  make logs SERVICE=gamelog- Follow logs for a specific service (gamelog or db)"
	@echo ""
	@echo "Rebuilds:"
	@echo "  make rebuild             - Rebuild and recreate all services"
	@echo "  make rebuild-gamelog     - Rebuild and recreate only the API container"
	@echo "  make rebuild-no-cache    - Rebuild all services without cache"
	@echo "  make rebuild-gamelog-no-cache - Rebuild only the API container without cache"
	@echo ""
	@echo "Database Workflows & Setup:"
	@echo "  make setup               - Initial setup: start services, migrate DB, insert seed data"
	@echo "  make db-reset            - Reset DB volume, apply migrations and seed data in one step"
	@echo "  make db-fresh-baseline   - Wipe old migration files, clean DB, create fresh baseline revision & seed"
	@echo ""
	@echo "Database Migrations & Seed:"
	@echo "  make migrate             - Apply pending Alembic migrations to DB"
	@echo "  make revision m=\"...\"    - Autogenerate an Alembic migration script"
	@echo "  make downgrade           - Roll back the last Alembic migration"
	@echo "  make seed                - Load demo data into PostgreSQL database"
	@echo "  make seed-firebase       - Seed/authenticate Firebase Auth test users & display Bearer tokens"
	@echo "                             (Supports ARGS=\"--cloud\", ARGS=\"--emulator\", or ARGS=\"email@test.com\")"
	@echo ""
	@echo "Database Utilities & Snapshots:"
	@echo "  make db-shell            - Open a psql shell in the database container"
	@echo "  make db-clean            - Clean DB volume and recreate empty schema"
	@echo "  make db-snapshot         - Create a SQL dump of current DB state"
	@echo "  make db-restore          - Restore DB from latest snapshot"

# ==============================================================================
# 🐳 LIFECYCLE & SERVICES
# ==============================================================================

up:
	USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR) $(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f $(SERVICE)

# ==============================================================================
# 🛠️ REBUILDS
# ==============================================================================

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

# ==============================================================================
# 🚀 DATABASE WORKFLOWS & SETUP
# ==============================================================================

setup: up migrate seed

db-reset: db-clean migrate seed

db-fresh-baseline:
	@python3 -c "import sys; ans = input('⚠️  ATTENZIONE: Questo comando eliminerà TUTTE le migrazioni in alembic/versions/ e resetterà il DB! Continuare? [y/N]: '); sys.exit(0 if ans.strip().lower() in ['y', 'yes'] else 1)" || (echo "❌ Operazione annullata." && exit 1)
	@echo "🗑️ Eliminazione vecchie migrazioni in alembic/versions/..."
	rm -f gamelog/alembic/versions/*.py
	$(MAKE) db-clean
	$(MAKE) revision m="$(if $(m),$(m),initial_schema)"
	$(MAKE) migrate
	$(MAKE) seed
	@echo "✅ Nuova migrazione baseline creata e DB azzerato/popolato con successo!"

# ==============================================================================
# 🗄️ DATABASE MIGRATIONS & SEED
# ==============================================================================

migrate:
	$(COMPOSE) exec gamelog uv run alembic upgrade head

revision:
ifndef m
	$(error ❌ Error: Please provide migration message. Usage: make revision m="Create users table")
endif
	$(COMPOSE) exec gamelog uv run alembic revision --autogenerate -m "$(m)"

downgrade:
	$(COMPOSE) exec gamelog uv run alembic downgrade -1

seed:
	$(COMPOSE) exec gamelog uv run python -m src.core.seed

seed-firebase:
	@cd gamelog && USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR) uv run python ../scripts/seed_firebase_users.py $(if $(filter false 0 no,$(USE_FIREBASE_EMULATOR)),--cloud,) $(ARGS)

# ==============================================================================
# 🧪 TESTING & CODE QUALITY
# ==============================================================================

test:
	$(COMPOSE) exec -e RUN_SCHEDULER=false gamelog uv run --group dev python -m pytest

test-local:
	@cd gamelog && RUN_SCHEDULER=false uv run --group dev python -m pytest

lint:
	@cd gamelog && uv run --group dev ruff format . && uv run --group dev ruff check . --fix || true

# ==============================================================================
# 🛠️ DATABASE UTILITIES & SNAPSHOTS
# ==============================================================================

db-shell:
	$(COMPOSE) exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

db-clean:
	$(COMPOSE) down -v
	$(COMPOSE) up -d
	@python -c "import time; time.sleep(3)"
	@echo "✅ Database cleaned and recreated"

db-snapshot:
	@mkdir -p $(SNAPSHOT_DIR)
	@ts=$$(date +%Y%m%d_%H%M%S); \
	$(COMPOSE) exec db pg_dump -U $(POSTGRES_USER) $(POSTGRES_DB) > $(SNAPSHOT_DIR)/snapshot_$$ts.sql; \
	ln -sf snapshot_$$ts.sql $(SNAPSHOT_DIR)/snapshot_latest.sql
	@echo "✅ Snapshot created and linked as snapshot_latest.sql"

db-restore:
	$(COMPOSE) down -v
	$(COMPOSE) up -d
	@python -c "import time; time.sleep(3)"
	$(COMPOSE) exec -T db psql -U $(POSTGRES_USER) $(POSTGRES_DB) < $(SNAPSHOT_DIR)/snapshot_latest.sql
	@echo "✅ Database restored from snapshot"
