.PHONY: lint tests run

PORT ?= 8000

lint:
	uvx ruff check . --fix
	uvx ruff format .

test:
	uv run pytest

run:
	uv run python -m uvicorn main:app --app-dir src --reload --port $(PORT)
