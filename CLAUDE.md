# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with two workspaces plus a root `Makefile` that orchestrates both:

- `backend/` — FastAPI + SQLModel + PostgreSQL, run through Docker Compose. Application code lives one level deeper in `backend/gamelog/` (that directory is the Python project root: `pyproject.toml`, `alembic.ini`, `src/`, `tests/`).
- `mobile-app/` — Expo / React Native (SDK 55) TypeScript client.

## Commands

Root `Makefile` (run from repo root) is the entry point for full-stack workflows:

```bash
make dev-emulator          # Firebase Auth emulator + backend + seed users + Expo Go
make dev-cloud             # same, but against live Firebase (EMULATOR=false)
make dev-init              # full DB reset, then the above
make dev-android-emulator  # native Android build instead of Expo Go (needed for Google Sign-In)
make up / down / logs      # backend Docker lifecycle
make test / lint           # both workspaces
```

`EMULATOR=true|false` on any target flips both `USE_FIREBASE_EMULATOR` (backend) and `EXPO_PUBLIC_USE_FIREBASE_EMULATOR` (mobile) at once; `START_EMULATOR=false` connects to an already-running emulator.

### Backend (`cd backend`)

```bash
make up                    # docker compose up -d (RUN_SCHEDULER=false)
make up prod               # same, but background scheduler enabled
make test                  # pytest inside the container
make test-local            # pytest on the host via uv  <- fastest loop
make lint                  # ruff format + ruff check --fix
make migrate               # alembic upgrade head (inside container)
make revision m="message"  # autogenerate a migration
make db-reset              # wipe volume, migrate, seed demo data
make seed-firebase         # create/authenticate test-01..test-05@test.com, print Bearer tokens
make db-shell              # psql
```

Tests run from `backend/gamelog` (pytest `testpaths = ["tests"]`, `pythonpath = ["."]`). Single test:

```bash
cd backend/gamelog && uv run --group dev python -m pytest tests/test_game_service.py::test_name -v
```

### Mobile app (`cd mobile-app`)

```bash
npm run start:backend      # Expo Go, EXPO_PUBLIC_API_PROVIDER=backend
npm run start:steam        # Expo Go, provider=steam
npm run android            # native dev build
npm run lint:fix && npm run prettier:fix   # run both before committing
npm test                   # jest --watchAll (always collects coverage)
npx jest __tests__/profile/ProfileView.test.tsx -t "renders"   # single test file / single case
npx jest --ci              # what CI runs
```

Jest enforces **80% global coverage** (lines/functions/branches/statements) and `collectCoverage` is always on, so a run can fail purely on thresholds. `collectCoverageFrom` in `package.json` excludes `src/dev/`, `src/utils/`, `types/`, the gluestack wrappers, `routes.tsx`, and `firebaseClient.ts` — new directories that shouldn't count toward coverage need adding there.

CI (`.github/workflows/`) runs Jest on every PR and super-linter scoped to `mobile-app/**/*.{ts,tsx}` only. The backend has no CI job.

## Backend architecture

Domain-per-package under `backend/gamelog/src/`, each with `*_router.py` (HTTP), `*_service.py` (logic + DB), and `schemas.py` (Pydantic/SQLModel DTOs): `games/`, `users/` (incl. friendships + notifications), `achievements/` (stub), `auth/`, `core/`, `models/`.

- **Entry point** `src/main.py` wires `initialize_firebase_app(settings)`, the routers, and the scheduler `lifespan`. Unprefixed endpoints `/health`, `/me`, `/protected` live there.
- **Config** `src/core/settings.py` — pydantic-settings with an explicit `validation_alias` per field, cached by `get_settings()`. Env var names differ from field names; add new vars there, in `compose.yml`, and in `.env.example`.
- **Auth** every protected route takes `auth_user: AuthenticatedUser = Depends(get_current_user)` (`src/auth/auth.py`), which verifies a Firebase ID token. Services then resolve the domain `User` by `firebase_uid` — the Firebase UID, not the DB UUID, is what crosses the API boundary.
- **DB** `src/core/database.py` owns the engine and the `get_db` session dependency. `wait_for_db_and_migrate()` retries the connection and runs `alembic upgrade head` on startup, and short-circuits when `DATABASE_URL` contains `sqlite` (the test path).
- **Models** SQLModel tables in `src/models/`, all re-exported from `src/models/__init__.py`. A model missing from that `__init__` is invisible to SQLModel metadata and to Alembic autogenerate.
- **Scheduler** `src/core/scheduler.py` is an async lifespan running a nightly per-user Steam sync (`update_user_shelving_steamrolling_async` plus a push notification), a weekly top-games job, and catch-up logic driven by `last_update` / `last_top_games_update` rows in the `config` table. Gated by `RUN_SCHEDULER`, which the Makefile defaults to `false` so local dev doesn't hit the Steam API.
- **Steam integration** `src/games/steam_fetcher_service.py` is the only place that talks to `api.steampowered.com`; it accepts an optional shared `httpx.AsyncClient` so the scheduler can reuse one connection pool across users. Playtime history is stored as `SteamRollingTime` snapshots and diffed into per-day playtime by `game_service._compute_daily_playtimes`.
- **Push** `notifications_service` persists a `Notification` row and fans out to the user's `DeviceToken`s via Firebase Cloud Messaging.

Tests (`backend/gamelog/tests/`) use `conftest.py`, which sets required env vars *before* importing the app, builds a fresh in-memory SQLite engine per test, and provides a `client` fixture overriding both `get_db` and `get_current_user` (fake uid `firebase-uid-1`). Use the `make_user` / `make_game` / `make_shelving` / `make_rolling` factories there rather than constructing models inline.

## Mobile app architecture

Feature-first directories under `src/`: `game-list/`, `game/`, `profile/`, `social/`, `dev/`, plus shared `common/`, `api-manager/`, `auth/`, `theme/`, `utils/`. Imports use the `@gamelog/*` → `./src/*` alias (tsconfig `paths`); relative imports only within a feature folder.

- **Navigation** is React Navigation *static* config in `src/routes.tsx` (`createStaticNavigation` in `App.tsx`) — `expo-router` is a dependency but is not the routing mechanism. Screens are registered in `GameListStack`, `TestingStack`, and `RootTabs`.
- **Data layer** is three layers, and a new endpoint must be added at all three:
  1. `api-manager/apiEndsPoints.ts` — every URL, Steam and backend alike. Backend URLs come from `EXPO_PUBLIC_BACKEND_BASE_URL`.
  2. `api-manager/apiManager.ts` — default-exported object of typed calls; `fetchData` for public Steam calls, `fetchAuthenticatedData` for backend calls (attaches `Authorization: Bearer <firebase idToken>` from `auth.currentUser`).
  3. `api-manager/useApi.ts` — one hook per call wrapping `common/useAsyncFetch` (handles unmount/stale-request guards) and returning domain-named fields such as `{ ownedGames, isLoadingOwnedGames, errorOwnedGames }`.

  DTOs live in `api-manager/dto/`.
- **Dual provider** `apiProvider.ts` holds a mutable `'steam' | 'backend'` selected by `EXPO_PUBLIC_API_PROVIDER`. The migration to the backend is partial: most game/achievement endpoints still hit Steam directly and carry a `// TODO: use isBackendProvider()` marker; only streaks, users, friends, recommendations, and notifications are backend-only.
- **Styling** NativeWind v4 (`className`, not `StyleSheet`) over thin gluestack-ui wrappers in `src/common/gluestack/` (`Box`, `VStack`, `HStack`, `Text`, …). Colors are semantic token classes (`bg-background-100`, `text-typography-300`, `border-outline-100`) whose RGB values are defined in `src/theme/theme.ts` and mapped in `tailwind.config.js`; light/dark comes from those tokens, so avoid hardcoded hex. Reusable presentational pieces live flat in `src/common/` (`SectionCard`, `SectionTabs`, `SectionState`, `StatBand`, `Chip`, `ProgressTrack`, `SeeAllLink`, `BackButton`, …) — recent commits have been consolidating feature views onto them, so prefer extending those over new one-off components. `SectionState` renders empty/error states through the `feedbacks/` boxes, so a section only supplies the two messages.
- **Screens** follow the `ProfileView`/`GameView` shape: hooks at the top, a single `isLoading` gate rendering `LoadingBox`, then `HeaderGameImage` + `ScrollablePage` (which owns the notch blur/scroll animation) wrapping feature sections. Pure data shaping goes in a sibling `*Selectors.ts` and is unit-tested directly.
- **Firebase** `src/auth/firebaseClient.ts` initializes the app from `EXPO_PUBLIC_FIREBASE_*` vars (throws on any missing one) and calls `connectAuthEmulator` unless `EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'false'`. On Android the emulator host must be a LAN/gateway IP, not `localhost`.
- **Dev tab** `src/dev/` is an in-app tools screen (generate a Firebase token, health check, palette/fonts, backend auth test) — the fastest way to exercise auth end-to-end on device.
- `jest.setup.ts` mocks fonts, blur, gradients, safe-area, AsyncStorage, Google Sign-In, and `@gamelog/auth/firebaseClient`. A newly used native/Expo module generally needs a mock added there.

## Conventions and gotchas

- Backend ruff: line length 150, double quotes, target py312.
- Prettier (mobile): single quotes, semicolons, width 100, 2-space tabs.
- `mobile-app/.env` and `backend/.env` are required and gitignored; copy from the `.env.example` next to each. Expo only picks up `EXPO_PUBLIC_*` changes after a full restart.
- Service account keys (`*serviceAccountKey*.json`) and `emulator-data/` are gitignored — never move a key into the repo; `compose.yml` mounts it from `GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH` as a Docker secret.
- `ProfileView.tsx` still hardcodes a Steam `USER_ID` constant instead of deriving it from the signed-in user.
