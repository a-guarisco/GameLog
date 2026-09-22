#!/usr/bin/env python3
"""
Utility script to seed/authenticate standard test accounts (test-01@test.com through test-05@test.com)
and retrieve Bearer Tokens for Swagger UI and API testing.

Supports both:
  1. 🛠️ Local Firebase Auth Emulator (port 9099)
  2. ☁️ Live Firebase Cloud Console (project gamelog-40e10)

Usage:
    python3 scripts/seed_firebase.py
    python3 scripts/seed_firebase.py test-02@test.com
    python3 scripts/seed_firebase.py --cloud
    python3 scripts/seed_firebase.py --emulator
"""

import argparse
import json
import os
from pathlib import Path
import socket
import sys
import urllib.error
import urllib.request

REPO_ROOT = Path(__file__).resolve().parent.parent

try:
    import firebase_admin
    from firebase_admin import auth, credentials
except ImportError:
    # If run outside uv, try to invoke via uv automatically
    import shutil
    import subprocess
    uv_path = shutil.which("uv")
    if uv_path:
        cmd = [uv_path, "run", "--project", str(REPO_ROOT / "backend" / "gamelog"), "python", __file__] + sys.argv[1:]
        result = subprocess.run(cmd)
        sys.exit(result.returncode)
    else:
        print("❌ Error: 'firebase-admin' package is required.")
        print("💡 Please run using uv: uv run --project backend/gamelog python scripts/seed_firebase.py")
        sys.exit(1)

CLOUD_WEB_API_KEY = os.environ.get("FIREBASE_WEB_API_KEY", "AIzaSyAVGPT6CKyiS_HmeGg_i0K7GH8qzSGpCWc")
EMULATOR_PORT = 9099
EMULATOR_URL = "http://localhost:9099"

TEST_USERS = [
    {
        "email": "samuele.grisoni@gmail.com",
        "password": "12345678",
        "displayName": "dedepivot",
        "localId": "dede1234567890abcdefghijklmn",
    },
    {
        "email": "alessio.guarisco@gmail.com",
        "password": "12345678",
        "displayName": "xrayman",
        "localId": "xrayman1234567890abcdefghijk",
    },
    {
        "email": "slaitroc@gmail.com",
        "password": "12345678",
        "displayName": "slaitroc",
        "localId": "slaitroc1234567890abcdefghij",
    },
    {
        "email": "test-01@test.com",
        "password": "12345678",
        "displayName": "test-01",
        "localId": "test011234567890abcdefghijkl",
    },
    {
        "email": "test-02@test.com",
        "password": "12345678",
        "displayName": "test-02",
        "localId": "test021234567890abcdefghijkl",
    },
    {
        "email": "test-03@test.com",
        "password": "12345678",
        "displayName": "test-03",
        "localId": "test031234567890abcdefghijkl",
    },
    {
        "email": "test-04@test.com",
        "password": "12345678",
        "displayName": "test-04",
        "localId": "test041234567890abcdefghijkl",
    },
    {
        "email": "test-05@test.com",
        "password": "12345678",
        "displayName": "test-05",
        "localId": "test051234567890abcdefghijkl",
    },
]


def is_emulator_running(port: int = EMULATOR_PORT) -> bool:
    for host in ("127.0.0.1", "localhost"):
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return True
        except OSError:
            pass
    return False


def setup_firebase_app(use_emulator: bool):
    if use_emulator:
        os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = f"localhost:{EMULATOR_PORT}"
        if not firebase_admin._apps:
            firebase_admin.initialize_app(options={"projectId": "gamelog-40e10"})
    else:
        os.environ.pop("FIREBASE_AUTH_EMULATOR_HOST", None)
        sa_key_path = (
            os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH")
            or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        )
        if not firebase_admin._apps:
            if sa_key_path and os.path.exists(sa_key_path):
                try:
                    cred = credentials.Certificate(sa_key_path)
                    firebase_admin.initialize_app(cred)
                except Exception:
                    firebase_admin.initialize_app(options={"projectId": "gamelog-40e10"})
            else:
                firebase_admin.initialize_app(options={"projectId": "gamelog-40e10"})


def seed_and_get_tokens(target_email: str | None = None, force_cloud: bool = False, force_emulator: bool = False):
    env_emulator = os.environ.get("USE_FIREBASE_EMULATOR", "").lower() in ("true", "1", "yes")
    env_cloud = os.environ.get("USE_FIREBASE_EMULATOR", "").lower() in ("false", "0", "no")

    if force_emulator or env_emulator:
        use_emulator = True
    elif force_cloud or env_cloud:
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

    users_to_process = TEST_USERS
    if target_email:
        users_to_process = [u for u in TEST_USERS if u["email"] == target_email]
        if not users_to_process:
            users_to_process = [{"email": target_email, "password": "password123", "displayName": target_email.split('@')[0], "localId": None}]

    tokens = {}
    for user_data in users_to_process:
        email = user_data["email"]
        password = user_data["password"]
        local_id = user_data.get("localId")
        display_name = user_data.get("displayName")

        # 1. Ensure user exists in Auth
        try:
            auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            try:
                auth.create_user(
                    uid=local_id,
                    email=email,
                    password=password,
                    display_name=display_name,
                    email_verified=True,
                )
                print(f"  ✨ Created user: {email} (UID: {local_id or 'auto'})")
            except Exception as e:
                print(f"  ⚠️ Could not create user {email}: {e}")
        except Exception as e:
            print(f"  ⚠️ Lookup failed for {email}: {e}")

        # 2. Authenticate and retrieve ID token
        payload = json.dumps({"email": email, "password": password, "returnSecureToken": True}).encode("utf-8")
        req = urllib.request.Request(
            signin_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                token = data.get("idToken")
                tokens[email] = token
                print(f"  🔑 {display_name or email:<12} ({email}):")
                print(f"     UID: {data.get('localId')}")
                print(f"     Bearer {token}\n")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f"  ❌ Auth failed for {email}: HTTP {e.code} - {err_body}\n")
        except Exception as e:
            print(f"  ❌ Auth failed for {email}: {e}\n")

    return tokens


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed test accounts and generate Firebase Bearer tokens.")
    parser.add_argument("email", nargs="?", default=None, help="Target email to retrieve token for (optional)")
    parser.add_argument("--cloud", action="store_true", help="Force Live Firebase Cloud Console mode")
    parser.add_argument("--emulator", action="store_true", help="Force Local Firebase Auth Emulator mode")
    args = parser.parse_args()

    seed_and_get_tokens(
        target_email=args.email,
        force_cloud=args.cloud,
        force_emulator=args.emulator,
    )
