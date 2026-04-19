include .env
export

.PHONY: up down restart logs db-shell rebuild rebuild-backend rebuild-no-cache rebuild-backend-no-cache

up:
	docker compose up -d

rebuild:
	docker compose up -d --build --force-recreate

rebuild-backend:
	docker compose up -d --build --force-recreate backend

rebuild-no-cache:
	docker compose build --no-cache
	docker compose up -d --force-recreate

rebuild-backend-no-cache:
	docker compose build --no-cache backend
	docker compose up -d --force-recreate backend

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

db-shell:
	docker exec -it steam_stats_db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)
