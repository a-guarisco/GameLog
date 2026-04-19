PORT ?= 8000
.PHONY: help lint test run seed migrate revision stamp downgrade downgrade-all

help:
	@echo "GameLog Backend Commands 🎮"
	@echo ""
	@echo "Code Quality 📝:"
	@echo "    make lint       - Fix code style with ruff"
	@echo "    make test       - Run pytest tests"
	@echo ""
	@echo "Development 🚀:"
	@echo "    make run          - Start dev server (http://localhost:8000)"
	@echo "    make run PORT=9000 - Start on custom port"
	@echo ""
	@echo "Database (Alembic Migrations) 🗄️:"
	@echo "    make migrate        - Apply all pending migrations to DB"
	@echo "    make revision m=\"Description\" - Create NEW migration"
	@echo "    make stamp r=\"Revision\"     - Mark DB as already aligned"
	@echo "    make seed           - Load demo data into the DB"
	@echo "    make downgrade      - Rollback ONE migration"
	@echo "    make downgrade-all  - Rollback ALL migrations (careful!)"
	@echo ""

lint:
	uv run --group dev ruff check . --fix
	uv run --group dev ruff format .

test:
	uv run --group dev python -m pytest

run:
	uv run python -m uvicorn main:app --app-dir src --reload --port $(PORT)

# 🗄️ DATABASE MIGRATIONS
migrate:
	@echo "📦 Applying migrations..."
	(cd .. && docker compose -f compose.yml exec gamelog uv run alembic upgrade head)
	@echo "✅ Done!"

revision:
	@if [ -z "$(m)" ]; then \
		echo "❌ Error: Please provide migration message"; \
		echo "   Usage: make revision m=\"Create users table\""; \
		exit 1; \
	fi
	@echo "🆕 Creating migration: $(m)"
	(cd .. && docker compose -f compose.yml exec gamelog uv run alembic revision --autogenerate -m "$(m)")
	@echo "✅ Done! Run 'make migrate' to apply"

seed:
	@echo "🌱 Loading demo data..."
	(cd .. && docker compose -f compose.yml exec gamelog uv run python -m src.seed)
	@echo "✅ Done! Demo data is ready for Adminer"

stamp:
	@if [ -z "$(r)" ]; then \
		echo "❌ Error: Please provide a revision id"; \
		echo "   Usage: make stamp r=0001_initial_schema"; \
		exit 1; \
	fi
	@echo "⚠️  Stamping database to revision: $(r)"
	uv run alembic stamp $(r)
	@echo "✅ Done! Alembic version table updated without running schema changes"

downgrade:
	@echo "⏮️  Rolling back one migration..."
	uv run alembic downgrade -1
	@echo "✅ Done!"

downgrade-all:
	@echo "⚠️  WARNING: Rolling back ALL migrations!"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		uv run alembic downgrade base; \
		echo "✅ Done!"; \
	else \
		echo "Cancelled"; \
	fi
