# GameLog

GameLog is split into two main workspaces:

- `backend/`: FastAPI API, PostgreSQL, Docker Compose, Firebase Admin SDK.
- `mobile-app/`: Expo / React Native client, dev tools, and test views.

This repository currently supports a Firebase-based authentication flow that can be tested end to end from the mobile app to the backend.

## Authentication test flow

The authentication flow is intended for local development and manual validation.

### 1. Get access to the Firebase project

First, make sure you have access to the Firebase project used by the app. If you do not have access yet, request it from the project owner or ask for a test user to be created in Firebase Authentication.

### 2. Download the Firebase Admin credentials

The backend needs the Firebase service account JSON file to verify tokens.

Download the service account key from the Firebase project and keep it outside the repository.

### 3. Configure the backend environment

Set the Firebase service account path in `backend/.env`.

Use the host path to the JSON file, for example:

```bash
GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH=/absolute/path/to/serviceAccountKey.json
```

The Docker Compose setup mounts that file into the backend container as `/run/secrets/firebase-service-account.json`.

### 4. Configure the mobile environment

Copy the example file and edit it:

```bash
cp mobile-app/.env.example mobile-app/.env
```

For the auth flow, set these variables in `mobile-app/.env`:

- `EXPO_PUBLIC_BACKEND_BASE_URL`: backend URL reachable from the emulator or device.
- `EXPO_PUBLIC_TOKEN_GEN_EMAIL`: test Firebase user email.
- `EXPO_PUBLIC_TOKEN_GEN_PASSWORD`: test Firebase user password.
- `EXPO_PUBLIC_TEST_BEARER_TOKEN`: temporary bearer token copied from the app after generating it.

The token cannot be filled in advance during the first login step. Generate it from the app, copy it from the console, and paste it into the env file for the next request.

### 5. Start Docker

Start the backend stack from `backend/`:

```bash
make up
```

This starts:

- FastAPI backend on `http://localhost:8000`
- PostgreSQL on `5432`
- Adminer on `http://localhost:8080`

### 6. Start the Expo client

Open `mobile-app/` and start Expo with the provider you need:

```bash
npm run start:backend
```

If you are testing on Android emulator, make sure `EXPO_PUBLIC_BACKEND_BASE_URL` points to your host LAN IP or to the emulator-compatible host.

### 7. Open Dev View and generate the token

In the app, open the Dev tab and use the Firebase token generator.

The token generation button signs in with the test Firebase user and prints the ID token in the console. Copy that token and paste it into `EXPO_PUBLIC_TEST_BEARER_TOKEN`.

### 8. Test the protected endpoint

After updating the env file with the token, restart Expo so the new environment variables are loaded.

Then go back to Dev View and press the final auth test button.

The auth test currently expects a simple result from the protected backend endpoint:

- `ok` if the token is accepted
- `unauthorized` if the token is rejected

## Useful references

- Backend setup: [backend/README.md](backend/README.md)
- Mobile app setup: [mobile-app/README.md](mobile-app/README.md)
- Firebase service account env example: [backend/.env.example](backend/.env.example)
- Mobile env example: [mobile-app/.env.example](mobile-app/.env.example)
