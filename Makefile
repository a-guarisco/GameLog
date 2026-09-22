# ==============================================================================
# 🎮 GameLog Monorepo Makefile
# ==============================================================================

PYTHON ?= $(shell command -v python3 2>/dev/null || command -v python 2>/dev/null || echo python)

.PHONY: help dev down test test-backend test-mobile test-contracts lint lint-backend lint-mobile db-reset seed-firebase emulator

# ------------------------------------------------------------------------------
# 🚀 Help
# ------------------------------------------------------------------------------
help:
	@echo "🎮 GameLog Development Commands"
	@echo ""
	@echo "🚀 Orchestration (Unified Development):"
	@echo "  make dev                 - Start local dev environment (supports ARGS=\"...\")"
	@echo "                             e.g. make dev ARGS=\"--help\""
	@echo "                             e.g. make dev ARGS=\"--android\""
	@echo "                             e.g. make dev ARGS=\"--init\""
	@echo "  make down                - Stop backend Docker services and Firebase emulator"
	@echo ""
	@echo "🧪 Testing & Code Quality:"
	@echo "  make test                - Run all tests (Backend pytest + Mobile Jest)"
	@echo "  make test-backend        - Run FastAPI pytest suite"
	@echo "  make test-mobile         - Run Expo / React Native Jest suite"
	@echo "  make test-contracts      - Export OpenAPI schema and run mobile contract tests"
	@echo "  make lint                - Run all linters (ruff + eslint)"
	@echo "  make lint-backend        - Run ruff linter & formatter on backend"
	@echo "  make lint-mobile         - Run expo linter on mobile app"
	@echo ""
	@echo "🛠️ Database & Utilities:"
	@echo "  make db-reset            - Reset database and re-seed with mock data"
	@echo "  make seed-firebase       - Seed test accounts in Firebase Auth and print Bearer tokens"
	@echo "  make emulator            - Manage Firebase Auth Emulator (supports ARGS=\"...\")"
	@echo "                             e.g. make emulator"
	@echo "                             e.g. make emulator ARGS=\"stop\""
	@echo "                             e.g. make emulator ARGS=\"status\""

# ------------------------------------------------------------------------------
# 🚀 Dev Orchestration
# ------------------------------------------------------------------------------
dev:
	@$(PYTHON) scripts/dev.py $(or $(ARGS),$(args))

down:
	@docker compose -f backend/compose.yml down
	@$(PYTHON) scripts/emulator.py stop

# ------------------------------------------------------------------------------
# 🧪 Testing & Code Quality
# ------------------------------------------------------------------------------
test: test-backend test-mobile

test-backend:
	@uv run --project backend/gamelog pytest backend/gamelog/tests

test-mobile:
	@npm --prefix mobile-app run tests

test-contracts:
	@$(PYTHON) scripts/export_openapi.py
	@npm --prefix mobile-app run test:contracts

lint: lint-backend lint-mobile

lint-backend:
	@uv run --project backend/gamelog ruff check backend/gamelog
	@uv run --project backend/gamelog ruff format --check backend/gamelog

lint-mobile:
	@npm --prefix mobile-app run lint

# ------------------------------------------------------------------------------
# 🛠️ Database & Auth Utilities
# ------------------------------------------------------------------------------
db-reset:
	@$(MAKE) -C backend db-reset

seed:
	@$(MAKE) -C backend seed

crawl-steam:
	@$(PYTHON) scripts/crawl_steam.py --override $(if $(MOCK_USERS),--mock-users $(MOCK_USERS)) $(or $(ARGS),$(args))


seed-firebase:
	@$(PYTHON) scripts/seed_firebase.py $(ARGS)

emulator:
	@$(PYTHON) scripts/emulator.py $(or $(ARGS),$(args))
