# ==============================================================================
# GameLog Root Monorepo Makefile
# ==============================================================================

.PHONY: help up down emulator emulator-bg seed-firebase test test-backend test-mobile lint lint-backend lint-mobile dev-mobile dev-all

help:
	@echo "GameLog Monorepo Commands"
	@echo ""
	@echo "🚀 Full Environment Setup & Launch:"
	@echo "  make dev-all        - Full zero-to-hero startup: emulator, DB reset, seed data, and launch Expo CLI"
	@echo ""
	@echo "🛠️ Individual Services & Lifecycle:"
	@echo "  make up             - Start backend Docker services"
	@echo "  make down           - Stop backend Docker services"
	@echo "  make emulator       - Start local Firebase Auth Emulator in foreground"
	@echo "  make seed-firebase  - Seed test users in Firebase Auth and print Bearer Tokens"
	@echo "  make dev-mobile     - Start Expo Mobile App dev server"
	@echo ""
	@echo "🧪 Testing & Code Quality:"
	@echo "  make test           - Run full test suite (Backend pytest + Mobile Jest)"
	@echo "  make test-backend   - Run backend pytest test suite locally"
	@echo "  make test-mobile    - Run mobile app Jest test suite"
	@echo "  make lint           - Run all linters (Backend ruff + Mobile Expo lint)"
	@echo "  make lint-backend   - Run backend ruff linter & formatter"
	@echo "  make lint-mobile    - Run mobile app Expo linter"

# ------------------------------------------------------------------------------
# Full Monorepo Zero-to-Hero Launcher
# ------------------------------------------------------------------------------

emulator-bg:
	@if ! nc -z 127.0.0.1 9099 2>/dev/null; then \
		echo "🔥 Starting Firebase Auth Emulator in background..."; \
		npx firebase emulators:start --only auth --project gamelog-40e10 --import=./emulator-data --export-on-exit=./emulator-data > /tmp/firebase-emulator.log 2>&1 & \
		sleep 3; \
	else \
		echo "🔥 Firebase Auth Emulator is already running on port 9099"; \
	fi

dev-all: emulator-bg
	@echo "🔄 Starting backend services & resetting database..."
	@make -C backend db-reset
	@echo "🔑 Seeding Firebase test accounts..."
	@make -C backend seed-firebase
	@echo "🌱 Seeding PostgreSQL database..."
	@make -C backend seed
	@cd mobile-app && npx expo start --go -c

# ------------------------------------------------------------------------------
# Services & Lifecycle
# ------------------------------------------------------------------------------

up:
	@make -C backend up

down:
	@make -C backend down

emulator:
	@npx firebase emulators:start --only auth --project gamelog-40e10 --import=./emulator-data --export-on-exit=./emulator-data

seed-firebase:
	@make -C backend seed-firebase

dev-mobile:
	@cd mobile-app && npx expo start --go -c

# ------------------------------------------------------------------------------
# Testing & Code Quality
# ------------------------------------------------------------------------------

test: test-backend test-mobile

test-backend:
	@make -C backend test-local

test-mobile:
	@npm --prefix mobile-app test -- --watchAll=false

lint: lint-backend lint-mobile

lint-backend:
	@make -C backend lint

lint-mobile:
	@npm --prefix mobile-app run lint
