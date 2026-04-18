.PHONY: lint tests

lint:
	uvx ruff check . --fix
	uvx ruff format .

tests:
	uv run pytest