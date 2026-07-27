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
- `GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH` points to the Firebase service account key on host; Compose mounts it as a read-only secret inside the API container.

### Firebase auth prerequisites

The backend verifies Firebase ID tokens using the Firebase Admin SDK.

To make that work:

1. Request access to the Firebase project or ask for a test user to be created.
2. Download the Firebase service account JSON file from the Firebase console.
3. Keep the file outside the repository.
4. Set `GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH` in `backend/.env` to the absolute host path of that file.

Example:

```bash
GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH=/absolute/path/to/serviceAccountKey.json
```

The container receives the file as `/run/secrets/firebase-service-account.json` and uses it to validate bearer tokens sent by the mobile app.

### Firebase Key (Docker)

Add this variable in `backend/.env` (absolute path outside the repository):

```bash
GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH=/absolute/path/to/serviceAccountKey.json
```

Suggested local setup:

```bash
mkdir -p ~/.config/gamelog
cp /path/where/you/downloaded/serviceAccountKey.json ~/.config/gamelog/serviceAccountKey.json
chmod 600 ~/.config/gamelog/serviceAccountKey.json
```

At runtime, the API container reads the key from `/run/secrets/firebase-service-account.json`.

### Auth test endpoint

The backend exposes a protected auth test endpoint used by the mobile Dev View.

The mobile app sends a Firebase ID token through the `Authorization: Bearer <token>` header and the backend returns a simple outcome that can be checked from the UI.

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
