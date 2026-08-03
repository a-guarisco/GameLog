#!/usr/bin/env python3
"""
Utility script to seed/authenticate standard test accounts (test-01@test.com through test-05@test.com)
and retrieve live Bearer Tokens for Swagger UI and API testing.

Supports both:
  1. 🛠️ Local Firebase Auth Emulator (auto-detected when running at localhost:9099 or 127.0.0.1:9099)
  2. ☁️ Live Firebase Cloud Console (project gamelog-40e10)

Usage:
    python3 scripts/seed_firebase_users.py
    python3 scripts/seed_firebase_users.py test-02@test.com
    python3 scripts/seed_firebase_users.py --cloud
    python3 scripts/seed_firebase_users.py --emulator
"""

import json
import os
import socket
import sys
import urllib.error
import urllib.request

try:
    import firebase_admin
    from firebase_admin import auth, credentials

    HAS_FIREBASE_ADMIN = True
except ImportError:
    HAS_FIREBASE_ADMIN = False

# Default fallback Cloud Web API key from project config
CLOUD_WEB_API_KEY = os.environ.get("FIREBASE_WEB_API_KEY", "AIzaSyAVGPT6CKyiS_HmeGg_i0K7GH8qzSGpCWc")
EMULATOR_PORT = 9099
EMULATOR_URL = "http://localhost:9099"

TEST_USERS = [
    {
        "email": "test-01@test.com",
        "password": "12345678",
        "displayName": "test-01",
        "localId": "YLRMA6otQ1YDqHlD5j8Wr0u0lpJ2",
    },
    {
        "email": "test-02@test.com",
        "password": "12345678",
        "displayName": "test-02",
        "localId": "tcYaHPGYDkVBlnNrcI7jNf2z4MS2",
    },
    {
        "email": "test-03@test.com",
        "password": "12345678",
        "displayName": "test-03",
        "localId": "GRbqhGIYlzb1GHEaBINeJq1ZXld2",
    },
    {
        "email": "test-04@test.com",
        "password": "12345678",
        "displayName": "test-04",
        "localId": "wcMFGsVqaYYNHSAeUXgGiK14WPk2",
    },
    {
        "email": "test-05@test.com",
        "password": "12345678",
        "displayName": "test-05",
        "localId": "a7swvzI0APgq57SMa8B7PsHevG02",
    },
]


def is_emulator_running(port: int = EMULATOR_PORT) -> bool:
    """Checks whether the local Firebase Auth Emulator port is listening on 127.0.0.1 or localhost."""
    for host in ("127.0.0.1", "localhost"):
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return True
        except OSError:
            pass
    return False


def setup_firebase_app(use_emulator: bool):
    """Initializes Firebase Admin SDK for either Emulator or Cloud mode if package is installed."""
    if not HAS_FIREBASE_ADMIN:
        return

    if use_emulator:
        os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = f"localhost:{EMULATOR_PORT}"
        if not firebase_admin._apps:
            firebase_admin.initialize_app(options={"projectId": "gamelog-40e10"})
    else:
        os.environ.pop("FIREBASE_AUTH_EMULATOR_HOST", None)
        sa_key_path = os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS",
            "/home/slaitroc/.config/gamelog/serviceAccountKey.json",
        )
        if not firebase_admin._apps:
            if os.path.exists(sa_key_path):
                cred = credentials.Certificate(sa_key_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app(options={"projectId": "gamelog-40e10"})


def seed_and_get_tokens(target_email: str | None = None, force_cloud: bool = False, force_emulator: bool = False):
    use_emulator = False
    if force_emulator:
        use_emulator = True
    elif force_cloud:
        use_emulator = False
    else:
        use_emulator = is_emulator_running()

    setup_firebase_app(use_emulator)

    if use_emulator:
        print(f"🔥 Mode: LOCAL EMULATOR ({EMULATOR_URL})\n")
        signin_url = f"{EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key"
    else:
        print("☁️ Mode: FIREBASE CLOUD CONSOLE (gamelog-40e10)\n")
        signin_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={CLOUD_WEB_API_KEY}"

    user_tokens = {}

    for user in TEST_USERS:
        uid = user["localId"]
        email = user["email"]
        password = user["password"]
        display_name = user["displayName"]

        if use_emulator:
            seeded = False

            # 1. Try seeding via Firebase Admin SDK if available
            if HAS_FIREBASE_ADMIN:
                try:
                    try:
                        u = auth.get_user(uid)
                        print(f"  ℹ️ User {display_name} ({email}) exists in emulator ➔ UID: {u.uid}")
                        seeded = True
                    except auth.UserNotFoundError:
                        u = auth.create_user(
                            uid=uid,
                            email=email,
                            password=password,
                            display_name=display_name,
                        )
                        print(f"  ✅ Created user {display_name} ({email}) in emulator ➔ UID: {u.uid}")
                        seeded = True
                except Exception:
                    seeded = False

            # 2. Fallback: Seed directly via Emulator Admin REST API (works without firebase-admin package on all OSes)
            if not seeded:
                rest_admin_url = (
                    f"{EMULATOR_URL}/identitytoolkit.googleapis.com/v1/projects/gamelog-40e10/accounts?key=fake-api-key"
                )
                rest_payload = json.dumps({
                    "localId": uid,
                    "email": email,
                    "password": password,
                    "displayName": display_name,
                }).encode("utf-8")
                rest_headers = {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer owner",
                }
                req_seed = urllib.request.Request(rest_admin_url, data=rest_payload, headers=rest_headers)
                try:
                    with urllib.request.urlopen(req_seed) as resp_seed:
                        print(f"  ✅ Created user {display_name} ({email}) in emulator ➔ UID: {uid}")
                except urllib.error.HTTPError as err_seed:
                    err_text = err_seed.read().decode("utf-8")
                    if "EMAIL_EXISTS" in err_text or "DUPLICATE" in err_text or "LOCAL_ID_EXISTS" in err_text:
                        print(f"  ℹ️ User {display_name} ({email}) already exists in emulator ➔ UID: {uid}")
                    else:
                        print(f"  ❌ Error seeding user {email} via REST: {err_text}")
                except Exception as ex_seed:
                    print(f"  ❌ Error seeding user {email} via REST: {ex_seed}")
        else:
            if HAS_FIREBASE_ADMIN:
                try:
                    u = auth.get_user(uid)
                    print(f"  ℹ️ User {display_name} ({email}) found in Cloud Auth ➔ UID: {u.uid}")
                except Exception:
                    pass

        # Retrieve live bearer token via signInWithPassword REST endpoint
        payload = json.dumps({
            "email": email,
            "password": password,
            "returnSecureToken": True,
        }).encode("utf-8")
        headers = {"Content-Type": "application/json"}

        req = urllib.request.Request(signin_url, data=payload, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                token = data.get("idToken")
                user_tokens[email] = (display_name, token)
        except urllib.error.HTTPError as err:
            err_msg = err.read().decode("utf-8")
            print(f"  ❌ Error retrieving token for {email}: {err_msg}")
        except Exception as ex:
            print(f"  ❌ Error retrieving token for {email}: {ex}")

    print("\n==============================================================================")
    print("🔑 Live Bearer Tokens for Test Accounts")
    print("==============================================================================")

    if target_email:
        if target_email in user_tokens:
            name, token = user_tokens[target_email]
            print(f"\n• {name} ({target_email}):")
            print(token)
        else:
            print(f"❌ User '{target_email}' not found in test accounts list.")
    else:
        for email, (name, token) in user_tokens.items():
            print(f"\n• {name} ({email}):")
            print(token)

    print("\n💡 Paste any token above into Swagger UI (http://localhost:8000/docs) Authorize 🔓 button")


if __name__ == "__main__":
    args = sys.argv[1:]
    force_cloud = "--cloud" in args
    force_emulator = "--emulator" in args
    target_email = next((a for a in args if "@" in a), None)

    seed_and_get_tokens(target_email=target_email, force_cloud=force_cloud, force_emulator=force_emulator)
