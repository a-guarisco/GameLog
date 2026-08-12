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
- [Google Sign-In (OAuth2) Configuration](#google-sign-in-oauth2-configuration)
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

#### Standard Test Users & Bearer Token Retrieval

The backend workspace includes an automated helper script (`backend/scripts/seed_firebase_users.py`, runnable via `backend/Makefile`) to populate and authenticate the 5 standard test accounts (`test-01@test.com` through `test-05@test.com`) with production-matching UIDs (`YLRMA6ot...`, etc.) and display fresh Bearer tokens for Swagger UI and API testing.

- **Dual-Mode Auto-Detection**:
  The script automatically detects whether the local Firebase Auth Emulator is active on port `9099`:
  - **Local Emulator Mode**: Automatically seeds missing test users into the emulator with target UIDs, then generates local Bearer tokens.
  - **Live Cloud Console Mode**: If the emulator is offline (or when using `ARGS="--cloud"`), authenticates directly against the live Firebase Cloud Console project (`gamelog-40e10`) and outputs real Google-signed Bearer tokens.

- **Command-Line Reference** (run from `backend/` directory):

  ```bash
  cd backend

  # Auto-detect mode (Emulator if active, Cloud Console if offline)
  make seed-firebase

  # Force Live Firebase Cloud Console mode
  make seed-firebase ARGS="--cloud"

  # Force Local Firebase Auth Emulator mode
  make seed-firebase ARGS="--emulator"

  # Retrieve token for a specific user (e.g. test-02@test.com)
  make seed-firebase ARGS="test-02@test.com"
  ```

- **Via Mobile App Dev View**:
  Start the mobile client (`npm run start:backend`), open the **Dev Tab**, and press **"Generate Firebase Token"**. The app automatically registers `test-01` (`test-01@test.com`) against the emulator and saves the token to local device storage.

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

## End-to-End Authentication Test Flow

To validate authentication end-to-end from the mobile app to the backend:

1. **Run the Full Stack (Backend + Mobile)**:
   From the repository root, run the comprehensive Makefile command:

   ```bash
   make dev-android-emulator
   ```

   *(This will automatically start the backend, seed the test users, and launch the Android build).*
2. **Open Dev View in Mobile App**:
   - Press **Generate Firebase Token** to log in as the test user (`test@test.com`). The session token is saved on device storage.
   - Press **Test Backend Auth**. The app sends `GET /me` with `Authorization: Bearer <token>`.
   - The backend validates the token and returns `200 OK Authorized` with decoded `uid`.

---

## Google Sign-In (OAuth2) Configuration

*(Note: Testing Google Sign-In requires a real Google account. Standard test accounts like `test@test.com` used in the End-to-End flow above will not work for this).*

To test Google Sign-In locally, ensure the following requirements are met:

1. **Web Client ID**: The `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` variable in your `.env` file must be set to the **Web Client ID** (not the Android one). You can find this in the `google-services.json` under `client_type: 3`.
2. **Debug SHA-1**: You do not need to generate or register a personal SHA-1 fingerprint. The project shares a common `debug.keystore` committed to Git, and its SHA-1 is already registered in Firebase.
3. **Test User Access**: The Google Cloud OAuth consent screen is in "Testing" mode. Your personal Google Account email **must** be added to the allowed test users list. Ask the project administrator (`slaitroc`) to add your email, otherwise Google Sign-In will throw an "Access Denied" error.

---

## Workspace Documentation Links

- **Backend Architecture & Docker Commands**: [backend/README.md](backend/README.md)
- **Mobile Client Setup & Dev View**: [mobile-app/README.md](mobile-app/README.md)
- **Backend Env Template**: [backend/.env.example](backend/.env.example)
- **Mobile Env Template**: [mobile-app/.env.example](mobile-app/.env.example)

---
