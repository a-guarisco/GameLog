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

`backend/.env` is required to start Docker services.

Required variables (with example values):

```env
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=steam_db
```

Notes:

- Do not commit real credentials.
- `DATABASE_URL` is built in `compose.yml` from these variables.

## Makefile in `backend/` (Docker)

From the `backend/` folder:

| What it does                                                       | Command                         |
| ------------------------------------------------------------------ | ------------------------------- |
| Start containers in background                                     | `make up`                       |
| Stop and remove containers                                         | `make down`                     |
| Restart containers                                                 | `make restart`                  |
| Stream logs                                                        | `make logs`                     |
| Rebuild images and recreate containers                             | `make rebuild`                  |
| Rebuild and recreate only the backend service                      | `make rebuild-backend`          |
| Rebuild all images without cache, then recreate containers         | `make rebuild-no-cache`         |
| Rebuild backend image without cache, then recreate backend service | `make rebuild-backend-no-cache` |
| Open a psql shell in the postgres container                        | `make db-shell`                 |

## Makefile in `backend/gamelog/` (Local FastAPI)

If you want to run the app without Docker:

Setup:

```bash
cd backend/gamelog
uv sync
```

| What it does                      | Command              |
| --------------------------------- | -------------------- |
| Start FastAPI on port 8000        | `make run`           |
| Start FastAPI on a different port | `make run PORT=8001` |
| Run tests                         | `make test`          |
| Run lint and formatting checks    | `make lint`          |

## Typical URLs:

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Adminer: `http://localhost:8080`
