import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials

from src.core.settings import Settings


def initialize_firebase_app(settings: Settings) -> None:
    if settings.use_firebase_emulator and settings.firebase_auth_emulator_host:
        os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = settings.firebase_auth_emulator_host
    else:
        os.environ.pop("FIREBASE_AUTH_EMULATOR_HOST", None)

    try:
        firebase_admin.get_app()
        return
    except ValueError:
        pass

    credentials_path = settings.firebase_service_account_key_path
    credential_file = Path(credentials_path).expanduser() if credentials_path else None
    has_valid_credentials = credential_file is not None and credential_file.is_file()

    # 1. Mode: Emulator without Service Account Key (Mock Credentials)
    if settings.use_firebase_emulator and not has_valid_credentials:
        firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
        print(
            f"[Firebase Admin] 🛠️ Mode: EMULATOR (Mock Creds) | Project: {settings.firebase_project_id} | Host: {settings.firebase_auth_emulator_host}",
            flush=True,
        )
        return

    # 2. Mode: Production (or specified file) without valid key file
    if not has_valid_credentials:
        missing_path_msg = f": '{credential_file}'" if credential_file else " (path not configured)"
        raise FileNotFoundError(
            f"Firebase service account key file not found{missing_path_msg}. "
            "To run without a service account key file, set USE_FIREBASE_EMULATOR=true in your environment."
        )

    cred = credentials.Certificate(str(credential_file))
    firebase_admin.initialize_app(cred)

    project_id = cred.project_id
    if settings.use_firebase_emulator and settings.firebase_auth_emulator_host:
        print(
            f"[Firebase Admin] 🛠️ Mode: EMULATOR | Project: {project_id} | Host: {settings.firebase_auth_emulator_host}",
            flush=True,
        )
    else:
        print(f"[Firebase Admin] ☁️ Mode: LIVE (Cloud) | Project: {project_id}", flush=True)
