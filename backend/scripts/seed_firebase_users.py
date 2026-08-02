#!/usr/bin/env python3
"""
Utility script to seed standard test accounts (test-01@test.com through test-05@test.com)
in the local Firebase Auth Emulator and retrieve live Bearer Tokens.

Usage:
    python backend/scripts/seed_firebase_users.py
    python backend/scripts/seed_firebase_users.py test-02@test.com
"""

import json
import sys
import urllib.error
import urllib.request

EMULATOR_HOST = "http://localhost:9099"
API_KEY = "fake-api-key"

TEST_USERS = [
    {"email": "test-01@test.com", "password": "12345678", "displayName": "test-01"},
    {"email": "test-02@test.com", "password": "12345678", "displayName": "test-02"},
    {"email": "test-03@test.com", "password": "12345678", "displayName": "test-03"},
    {"email": "test-04@test.com", "password": "12345678", "displayName": "test-04"},
    {"email": "test-05@test.com", "password": "12345678", "displayName": "test-05"},
]


def seed_and_get_tokens(target_email: str | None = None):
    print(f"🔥 Seeding test accounts in Firebase Auth Emulator at {EMULATOR_HOST}...\n")
    signup_url = f"{EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    signin_url = f"{EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"

    user_tokens = {}

    for user in TEST_USERS:
        payload = json.dumps({
            "email": user["email"],
            "password": user["password"],
            "returnSecureToken": True,
        }).encode("utf-8")

        headers = {"Content-Type": "application/json"}

        # Try sign up first
        req = urllib.request.Request(signup_url, data=payload, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                uid = data.get("localId")
                token = data.get("idToken")
                print(f"  ✅ Created user {user['displayName']} ({user['email']}) ➔ UID: {uid}")
                user_tokens[user["email"]] = (user["displayName"], token)
        except urllib.error.HTTPError as e:
            err_body = json.loads(e.read().decode("utf-8"))
            err_msg = err_body.get("error", {}).get("message", "")
            if "EMAIL_EXISTS" in err_msg:
                # User exists, try sign in to retrieve fresh token
                req_in = urllib.request.Request(signin_url, data=payload, headers=headers)
                try:
                    with urllib.request.urlopen(req_in) as resp_in:
                        data = json.loads(resp_in.read().decode("utf-8"))
                        uid = data.get("localId")
                        token = data.get("idToken")
                        print(f"  ℹ️ User {user['displayName']} ({user['email']}) already exists ➔ UID: {uid}")
                        user_tokens[user["email"]] = (user["displayName"], token)
                except Exception as ex:
                    print(f"  ❌ Error signing in {user['email']}: {ex}")
            else:
                print(f"  ❌ Error creating {user['email']}: {err_msg}")
        except Exception as e:
            print(f"  ❌ Failed to connect to emulator at {EMULATOR_HOST}: {e}")
            sys.exit(1)

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
    target = sys.argv[1] if len(sys.argv) > 1 and "@" in sys.argv[1] else None
    seed_and_get_tokens(target)
