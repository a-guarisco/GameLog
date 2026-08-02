# 🚀 GameLog Backend Guide

This directory contains the Docker orchestration, database setup, and FastAPI application for the GameLog backend.

---

## 📌 Table of Contents

- [Structure](#structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration (`.env`)](#environment-configuration-env)
- [Firebase Integration (Backend Runtime)](#firebase-integration-backend-runtime)
- [Makefile Reference](#makefile-reference)
  - [Environment & Scheduler Control (`RUN_SCHEDULER`)](#environment--scheduler-control-run_scheduler)
  - [🐳 Lifecycle & Services](#-lifecycle--services)
  - [🛠️ Rebuilds](#%EF%B8%8F-rebuilds)
  - [🗄️ Database & Migration Commands](#%EF%B8%8F-database--migration-commands)
- [Database Workflows & Lifecycle](#database-workflows--lifecycle)
- [Typical URLs](#typical-urls)

---

## Structure

- `compose.yml`: Docker services (`gamelog` API, `db` PostgreSQL, `adminer` web GUI)
- `compose.override.yml`: Local overrides (ports, Adminer styling)
- `.env`: Environment variables used by Docker Compose and FastAPI
- `Makefile`: Cross-platform command shortcut runner
- `gamelog/`: FastAPI code, Python dependencies (`uv.lock`), Alembic migrations, and unit tests

---

## Prerequisites

- **Docker + Docker Compose plugin** (v2.0+)
- **`uv`** (Package manager, required only if running FastAPI locally outside Docker)
- **Firebase Auth Setup**: See shared [Firebase Authentication Setup](../README.md#firebase-authentication-setup) in root README.

---

## Environment Configuration (`.env`)

Copy the example configuration file to create your local `.env`:

```bash
cp .env.example .env
```

### Key Environment Variables Breakdown

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Username for the PostgreSQL database container | `user` |
| `POSTGRES_PASSWORD` | Password for PostgreSQL | `password` |
| `POSTGRES_DB` | Database name created on startup | `steam_db` |
| `GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH` | **Absolute host path** to your Firebase service account JSON | `/home/user/.config/gamelog/serviceAccountKey.json` |
| `USE_FIREBASE_EMULATOR` | Set to `true` for local Firebase Auth Emulator, `false` for Firebase Cloud | `true` |
| `FIREBASE_AUTH_EMULATOR_HOST` | Host address for Firebase Auth Emulator container networking | `host.docker.internal:9099` |
| `RUN_SCHEDULER` | Toggle to enable/disable background sync jobs (`true`/`false`) | `true` |

---

## Firebase Integration (Backend Runtime)

For full instructions on setting up Firebase Auth (both Local Emulator and Cloud mode), see the shared [Firebase Authentication Setup Guide](../README.md#firebase-authentication-setup).

### Backend Runtime Secret Mounting
At runtime, Docker Compose mounts the host service account key securely as a read-only secret inside the `gamelog` API container at `/run/secrets/firebase-service-account.json`. When `USE_FIREBASE_EMULATOR=true`, the backend bypasses strict cloud key checks and verifies tokens using the local emulator.

### Protected Auth Endpoint
The backend exposes `GET /me` (requires `Authorization: Bearer <FIREBASE_ID_TOKEN>`) which verifies the token via Firebase Admin SDK and returns `200 OK` with user details.

---

## Makefile Reference

The `backend/Makefile` automates Docker lifecycle, database migrations, and testing tasks across **Linux, macOS, and Windows**.

### Environment & Scheduler Control (`RUN_SCHEDULER`)

- **Default**: `RUN_SCHEDULER=true` (background sync jobs run automatically).
- **`make dev` Override**: Adding `dev` (e.g., `make dev up` or `make dev rebuild`) dynamically exports `RUN_SCHEDULER=false` to temporarily disable background jobs during active development without modifying `.env`.

### 🐳 Lifecycle & Services

| Command | Description |
| :--- | :--- |
| `make up` | Starts all services in background (`gamelog`, `db`, `adminer`) |
| `make down` | Stops and removes all running containers and networks |
| `make restart` | Restarts all running services |
| `make logs` | Follows log output for all services |
| `make logs SERVICE=gamelog` | Follows log output for a specific service (`gamelog` or `db`) |

### 🛠️ Rebuilds

| Command | Description |
| :--- | :--- |
| `make rebuild` | Rebuilds Docker images and force-recreates all containers |
| `make rebuild-gamelog` | Rebuilds and force-recreates only the `gamelog` API container |
| `make rebuild-no-cache` | Rebuilds all services without using Docker build cache |
| `make rebuild-gamelog-no-cache` | Rebuilds only the `gamelog` API without build cache |

### 🗄️ Database & Migration Commands

| Command | Description |
| :--- | :--- |
| `make migrate` | Applies all pending Alembic migrations (`alembic upgrade head`) |
| `make revision m="Description"` | Autogenerates a new Alembic migration script *(Requires `m` parameter)* |
| `make downgrade` | Rolls back the last applied Alembic migration (`alembic downgrade -1`) |
| `make seed` | Populates the database with initial demo users and test data |
| `make db-shell` | Opens an interactive `psql` shell inside the PostgreSQL container |
| `make db-clean` | Destroys database volume (`down -v`) and recreates empty schema |
| `make db-snapshot` | Creates a SQL dump of current DB state in `postgres/snapshots/` |
| `make db-restore` | Restores database from `postgres/snapshots/snapshot_latest.sql` |

---

## Database Workflows & Lifecycle

To manage local database states efficiently, choose the appropriate workflow target:

- **`make setup` (Initial Setup)**: Use the first time you set up a fresh repository clone. Executes `up` ➔ `migrate` ➔ `seed`.
- **`make db-reset` (Daily Reset)**: Use during daily development when you want to wipe dirty test data and start clean without deleting migration files. Executes `db-clean` ➔ `migrate` ➔ `seed`.
- **`make db-fresh-baseline` (Baseline Reset)**: Use when refactoring data models before a release. Deletes old `.py` version files in `alembic/versions/`, wipes DB, autogenerates a single clean `initial_schema` baseline, applies it, and seeds test data. *(Includes interactive prompt confirmation)*.

For local development commands (without Docker), see [gamelog/README.md](gamelog/README.md).

---

## Typical URLs

- **API Base**: `http://localhost:8000`
- **Swagger Interactive API Docs**: `http://localhost:8000/docs`
- **Healthcheck Endpoint**: `http://localhost:8000/health`
- **Adminer Database GUI**: `http://localhost:8080` (System: `PostgreSQL`, Server: `db`, User: `user`, Pass: `password`, DB: `steam_db`)
