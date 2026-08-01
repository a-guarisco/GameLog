# 🎮 GameLog

GameLog is a full-stack gaming statistics and tracking platform split into two main workspaces:

- `backend/`: FastAPI REST API, PostgreSQL, Docker Compose, Alembic migrations, and Firebase Admin SDK.
- `mobile-app/`: Expo / React Native mobile client, custom charts, Dev View tools, and Firebase Auth client.

---

## 📌 Table of Contents

- [Workspaces Overview](#workspaces-overview)
- [Firebase Authentication Setup](#firebase-authentication-setup)
  - [Option A: Local Firebase Auth Emulator Workflow (Recommended - No Console Access Required)](#option-a-local-firebase-auth-emulator-workflow-recommended---no-console-access-required)
  - [Option B: Live Firebase Cloud Project (Production Mode)](#option-b-live-firebase-cloud-project-production-mode)
- [End-to-End Authentication Test Flow](#end-to-end-authentication-test-flow)
- [Workspace Documentation Links](#workspace-documentation-links)

---

## Workspaces Overview

| Workspace | Technology Stack | Documentation |
| :--- | :--- | :--- |
| **`backend/`** | Python 3.12, FastAPI, SQLModel, Alembic, PostgreSQL, Docker | [backend/README.md](backend/README.md) |
| **`mobile-app/`** | React Native, Expo SDK 52, TypeScript, Firebase SDK | [mobile-app/README.md](mobile-app/README.md) |

---

## Firebase Authentication Setup

GameLog uses Firebase Authentication to issue and verify JWT Bearer tokens between the Expo mobile app and the FastAPI backend.

### Option A: Local Firebase Auth Emulator Workflow (Recommended - No Console Access Required)

All teammates can run and test authentication locally **without needing developer access to the Firebase Console**:

1. **Public Client Credentials**: The mobile client configuration in `mobile-app/.env.example` already includes the public Firebase Web client keys for project `gamelog-40e10`.
2. **Start Local Auth Emulator**: From the repository root, start the Firebase Emulator:
   ```bash
   npx firebase emulators:start --only auth --project gamelog-40e10 --import=./emulator-data --export-on-exit
   ```
   *(No Google Cloud login or Firebase Console permissions required — the emulator runs 100% offline).*

3. **Backend Configuration (`USE_FIREBASE_EMULATOR=true`)**:
   In `backend/.env`:
   ```env
   USE_FIREBASE_EMULATOR=true
   FIREBASE_AUTH_EMULATOR_HOST=host.docker.internal:9099
   ```

4. **Mobile Client Configuration (`EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`)**:
   In `mobile-app/.env`:
   ```env
   EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true
   EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=http://localhost:9099
   ```

5. **Emulator User Interface**: Open `http://127.0.0.1:4000/auth` in your browser to manage local test users.

---

### Option B: Live Firebase Cloud Project (Production Mode)

To connect directly to live Firebase Cloud services:

1. Request developer access to the Firebase project or request a test account from the project administrator.
2. Download `serviceAccountKey.json` from the Firebase Console.
3. Place the file **outside the repository** (e.g. `~/.config/gamelog/serviceAccountKey.json`) to prevent committing sensitive keys to Git:
   ```bash
   mkdir -p ~/.config/gamelog
   cp /path/to/serviceAccountKey.json ~/.config/gamelog/serviceAccountKey.json
   chmod 600 ~/.config/gamelog/serviceAccountKey.json
   ```
4. Configure `GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH=/home/yourusername/.config/gamelog/serviceAccountKey.json` and `USE_FIREBASE_EMULATOR=false` in `backend/.env`.

---

## End-to-End Authentication Test Flow

To validate authentication end-to-end from the mobile app to the backend:

1. **Start Backend Stack**:
   ```bash
   cd backend && make up
   ```
2. **Start Mobile App**:
   ```bash
   cd mobile-app && npm run start:backend
   ```
3. **Open Dev View in Mobile App**:
   - Press **Generate Firebase Token** to log in as the test user (`test@test.com`). The session token is saved on device storage.
   - Press **Test Backend Auth**. The app sends `GET /me` with `Authorization: Bearer <token>`.
   - The backend validates the token and returns `200 OK Authorized` with decoded `uid`.

---

## Workspace Documentation Links

- **Backend Architecture & Docker Commands**: [backend/README.md](backend/README.md)
- **Mobile Client Setup & Dev View**: [mobile-app/README.md](mobile-app/README.md)
- **Backend Env Template**: [backend/.env.example](backend/.env.example)
- **Mobile Env Template**: [mobile-app/.env.example](mobile-app/.env.example)
