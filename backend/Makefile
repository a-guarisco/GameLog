-include .env
export
export UV_LINK_MODE=copy

COMPOSE ?= docker compose
SERVICE ?=
SNAPSHOT_DIR ?= postgres/snapshots
RUN_SCHEDULER ?= false

ifeq ($(OS),Windows_NT)
  PYTHON ?= python
else
  PYTHON ?= python3
endif

ifneq ($(filter prod,$(MAKECMDGOALS)),)
  RUN_SCHEDULER = true
endif

export RUN_SCHEDULER

.PHONY: help prod up down restart logs rebuild rebuild-no-cache db-reset migrate revision downgrade seed crawl-steam seed-firebase test lint db-shell

prod:
	@:

help:
	@echo "GameLog Backend Development Commands"
	@echo ""
	@echo "Lifecycle:"
	@echo "  make up                  - Start backend Docker containers in background"
	@echo "  make down                - Stop and remove backend containers"
	@echo "  make restart             - Restart all backend containers"
	@echo "  make logs                - Follow container logs (optional: SERVICE=gamelog)"
	@echo "  make rebuild             - Rebuild and recreate backend containers"
	@echo "  make rebuild-no-cache    - Rebuild containers without cache"
	@echo ""
	@echo "Database & Migrations:"
	@echo "  make db-reset            - Reset PostgreSQL database volume, migrate, and seed"
	@echo "  make migrate             - Apply pending Alembic migrations"
	@echo "  make revision m=\"...\"    - Autogenerate a new Alembic migration"
	@echo "  make downgrade           - Roll back the latest migration"
	@echo "  make seed                - Seed PostgreSQL database with sample data"
	@echo "  make crawl-steam         - Run Steam crawler to refresh seed_data_users.json"
	@echo "  make db-shell            - Open an interactive psql shell inside db container"
	@echo ""
	@echo "Auth & Quality:"
	@echo "  make seed-firebase       - Seed test users in Firebase Auth and print tokens"
	@echo "  make test                - Run pytest suite locally via uv"
	@echo "  make lint                - Run ruff linter & formatter on backend"

# ------------------------------------------------------------------------------
# 🐳 Lifecycle
# ------------------------------------------------------------------------------
up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f $(SERVICE)

rebuild:
	$(COMPOSE) up -d --build --force-recreate

rebuild-no-cache:
	$(COMPOSE) build --no-cache && $(COMPOSE) up -d --force-recreate

# ------------------------------------------------------------------------------
# 🗄️ Database & Migrations
# ------------------------------------------------------------------------------
db-reset:
	@echo "🛑 Stopping containers and purging DB volume..."
	$(COMPOSE) down -v
	@echo "🚀 Starting database container..."
	$(COMPOSE) up -d db
	@echo "⏳ Waiting for PostgreSQL to accept connections..."
	@until $(COMPOSE) exec -T db pg_isready -U $(POSTGRES_USER) -d $(POSTGRES_DB) >/dev/null 2>&1; do sleep 1; done
	@echo "🚀 Starting API service..."
	$(COMPOSE) up -d gamelog
	@echo "📦 Running database migrations..."
	$(COMPOSE) exec gamelog uv run alembic upgrade head
	@$(PYTHON) ../scripts/crawl_steam.py $(if $(MOCK_USERS),--mock-users $(MOCK_USERS))
	@echo "🌱 Seeding demo data..."
	$(COMPOSE) exec gamelog uv run python -m src.core.seed $(if $(MOCK_USERS),--mock-users $(MOCK_USERS))
	@echo "✅ Database reset and seeded successfully!"

migrate:
	$(COMPOSE) exec gamelog uv run alembic upgrade head

revision:
ifndef m
	$(error ❌ Error: Migration description required. Usage: make revision m="add_feature")
endif
	$(COMPOSE) exec gamelog uv run alembic revision --autogenerate -m "$(m)"

downgrade:
	$(COMPOSE) exec gamelog uv run alembic downgrade -1

seed:
	@$(PYTHON) ../scripts/crawl_steam.py $(if $(MOCK_USERS),--mock-users $(MOCK_USERS))
	$(COMPOSE) exec gamelog uv run python -m src.core.seed $(if $(MOCK_USERS),--mock-users $(MOCK_USERS))

crawl-steam:
	@$(PYTHON) ../scripts/crawl_steam.py --override $(if $(MOCK_USERS),--mock-users $(MOCK_USERS)) $(or $(ARGS),$(args))


db-shell:
	$(COMPOSE) exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# ------------------------------------------------------------------------------
# 🧪 Testing, Linting & Auth
# ------------------------------------------------------------------------------
test:
	@uv run --project gamelog pytest gamelog/tests

lint:
	@uv run --project gamelog ruff check gamelog --fix
	@uv run --project gamelog ruff format gamelog

seed-firebase:
	@$(PYTHON) ../scripts/seed_firebase.py $(if $(filter true 1 yes,$(USE_FIREBASE_EMULATOR)),--emulator,$(if $(filter false 0 no,$(USE_FIREBASE_EMULATOR)),--cloud,)) $(ARGS)
