# Backend Guide

This folder contains:

- Docker orchestration for the backend and database
- the FastAPI application in `gamelog/`

## Structure

- `compose.yml`: Docker services (`gamelog`, `db`, `adminer`)
- `compose.override.yml`: local overrides (ports, Adminer CSS)
- `.env`: variables used by Docker Compose
- `Makefile`: Docker commands
- `gamelog/`: FastAPI code, Python dependencies, tests, and app Makefile

## Prerequisites

- Docker + Docker Compose plugin
- `uv` (only if you want to run FastAPI outside Docker)

## Required .env file

Copy the example file and adjust it for your local setup:

```bash
cp .env.example .env
```

`backend/.env` is required to start Docker services.

Notes:

- Do not commit real credentials.
- `DATABASE_URL` is built in `compose.yml` from these variables.

## Makefile in `backend/` (Docker)

Quick reference for Docker commands:

| Task                                | Command                         |
| ----------------------------------- | ------------------------------- |
| Start all services                  | `make up`                       |
| Stop and remove containers          | `make down`                     |
| Restart all running services        | `make restart`                  |
| Follow all service logs             | `make logs`                     |
| Follow logs for one service         | `make logs SERVICE=db`          |
| Rebuild and recreate all services   | `make rebuild`                  |
| Rebuild only the API                | `make rebuild-gamelog`          |
| Rebuild all without cache           | `make rebuild-no-cache`         |
| Rebuild only API without cache      | `make rebuild-gamelog-no-cache` |
| Open psql shell in DB container     | `make db-shell`                 |
| Create SQL dump of current DB state | `make db-snapshot`              |
| Restore DB from latest snapshot     | `make db-restore`               |
| Clean DB volume and recreate schema | `make db-clean`                 |

Database snapshots are stored in `postgres/snapshots`.

For local development commands (without Docker), see [gamelog/README.md](gamelog/README.md).

## Typical URLs

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Adminer: `http://localhost:8080`
