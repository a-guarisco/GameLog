# ==============================================================================
# GameLog Root Monorepo Makefile
# ==============================================================================

# Emulator Toggle & Launcher Configuration
# Usage examples:
#   make dev-emulator                       (starts all processes in Local Emulator mode)
#   make dev-emulator START_EMULATOR=false  (skips bg emulator launch, connects to external emulator)
#   make dev-cloud                          (starts all processes in Cloud Firebase mode)
#   make dev-init                           (resets DB & launches all processes with Emulator)

EMULATOR ?= true
START_EMULATOR ?= true

USE_FIREBASE_EMULATOR := $(EMULATOR)
EXPO_PUBLIC_USE_FIREBASE_EMULATOR := $(EMULATOR)

export USE_FIREBASE_EMULATOR
export EXPO_PUBLIC_USE_FIREBASE_EMULATOR

.PHONY: help up down emulator emulator-bg seed-firebase test test-backend test-mobile lint lint-backend lint-mobile dev-mobile dev-init dev-cloud dev-emulator db-reset logs

help:
	@echo "GameLog Monorepo Commands"
	@echo ""
	@echo "🚀 Full Environment Setup & Launch (All Processes):"
	@echo "  make dev-emulator                   - Launch all processes in Firebase Emulator mode"
	@echo "  make dev-emulator START_EMULATOR=false - Launch all processes using external/manual emulator"
	@echo "  make dev-cloud                      - Launch all processes in Cloud Firebase mode"
	@echo "  make dev-init                       - Full DB reset & launch all processes with Emulator"
	@echo ""
	@echo "🛠️ Individual Services & Lifecycle:"
	@echo "  make up                             - Start backend Docker services"
	@echo "  make down                           - Stop backend Docker services"
	@echo "  make logs                           - Follow backend Docker container logs"
	@echo "  make db-reset                       - Reset PostgreSQL database & apply migrations"
	@echo "  make emulator                       - Start local Firebase Auth Emulator in foreground"
	@echo "  make seed-firebase                  - Seed test users in Firebase Auth and print Bearer Tokens"
	@echo "  make dev-mobile                     - Start Expo Mobile App dev server"
	@echo ""
	@echo "🧪 Testing & Code Quality:"
	@echo "  make test                           - Run full test suite (Backend pytest + Mobile Jest)"
	@echo "  make test-backend                   - Run backend pytest test suite locally"
	@echo "  make test-mobile                    - Run mobile app Jest test suite"
	@echo "  make lint                           - Run all linters (Backend ruff + Mobile Expo lint)"
	@echo "  make lint-backend                   - Run backend ruff linter & formatter"
	@echo "  make lint-mobile                    - Run mobile app Expo linter"

# ------------------------------------------------------------------------------
# Full Monorepo Launchers (Unified Process Orchestration)
# ------------------------------------------------------------------------------

emulator-bg:
	@if [ "$(USE_FIREBASE_EMULATOR)" = "true" ] || [ "$(USE_FIREBASE_EMULATOR)" = "1" ]; then \
		if [ "$(START_EMULATOR)" = "false" ] || [ "$(START_EMULATOR)" = "0" ]; then \
			echo "ℹ️  Firebase Auth Emulator auto-launch skipped (START_EMULATOR=false). Connecting to emulator on port 9099..."; \
		elif ! nc -z 127.0.0.1 9099 2>/dev/null; then \
			echo "🔥 Starting Firebase Auth Emulator in background..."; \
			npx firebase emulators:start --only auth --project gamelog-40e10 --import=./emulator-data --export-on-exit=./emulator-data > /tmp/firebase-emulator.log 2>&1 & \
			sleep 3; \
		else \
			echo "🔥 Firebase Auth Emulator is already running on port 9099"; \
		fi; \
	else \
		echo "☁️ Firebase Auth Emulator is DISABLED (All processes forced to Cloud Firebase)"; \
	fi

dev-init:
	@$(MAKE) dev-init-internal EMULATOR=true

dev-init-internal: emulator-bg
	@echo "🔄 [All Processes] Starting backend & resetting database (USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR))..."
	@make -C backend db-reset USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)
	@echo "🔑 [All Processes] Seeding Firebase test accounts..."
	@make -C backend seed-firebase USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)
	@echo "🌱 [All Processes] Seeding PostgreSQL database..."
	@make -C backend seed USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)
	@echo "📱 [All Processes] Launching Expo Mobile App (EXPO_PUBLIC_USE_FIREBASE_EMULATOR=$(EXPO_PUBLIC_USE_FIREBASE_EMULATOR))..."
	@cd mobile-app && EXPO_PUBLIC_USE_FIREBASE_EMULATOR=$(EXPO_PUBLIC_USE_FIREBASE_EMULATOR) npx expo start --go -c

dev-emulator:
	@$(MAKE) dev-run EMULATOR=true

dev-cloud:
	@$(MAKE) dev-run EMULATOR=false

dev-run: emulator-bg
	@echo "🔄 [All Processes] Starting backend services (USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR))..."
	@make -C backend up USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)
	@echo "🔑 [All Processes] Seeding Firebase test accounts..."
	@make -C backend seed-firebase USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)
	@echo "📱 [All Processes] Launching Expo Mobile App (EXPO_PUBLIC_USE_FIREBASE_EMULATOR=$(EXPO_PUBLIC_USE_FIREBASE_EMULATOR))..."
	@cd mobile-app && EXPO_PUBLIC_USE_FIREBASE_EMULATOR=$(EXPO_PUBLIC_USE_FIREBASE_EMULATOR) npx expo start --go -c

# ------------------------------------------------------------------------------
# Services & Lifecycle Shortcuts
# ------------------------------------------------------------------------------

up:
	@make -C backend up USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)

down:
	@make -C backend down

logs:
	@make -C backend logs

db-reset:
	@make -C backend db-reset USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)

emulator:
	@npx firebase emulators:start --only auth --project gamelog-40e10 --import=./emulator-data --export-on-exit=./emulator-data

seed-firebase:
	@make -C backend seed-firebase USE_FIREBASE_EMULATOR=$(USE_FIREBASE_EMULATOR)

dev-mobile:
	@cd mobile-app && EXPO_PUBLIC_USE_FIREBASE_EMULATOR=$(EXPO_PUBLIC_USE_FIREBASE_EMULATOR) npx expo start --go -c

# ------------------------------------------------------------------------------
# Testing & Code Quality Shortcuts
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
