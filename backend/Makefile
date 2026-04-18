.PHONY: lint tests run

lint:
	uvx ruff check . --fix
	uvx ruff format .

test:
	uv run pytest

run:
	uv run uvicorn main:app --app-dir src --reload