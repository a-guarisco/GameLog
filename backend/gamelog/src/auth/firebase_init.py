from pathlib import Path

import firebase_admin
from firebase_admin import credentials

from src.core.settings import Settings


def initialize_firebase_app(settings: Settings) -> None:
    try:
        firebase_admin.get_app()
        return
    except ValueError:
        pass

    credentials_path = settings.firebase_service_account_key_path
    credential_file = Path(credentials_path).expanduser()
    if not credential_file.is_file():
        raise FileNotFoundError(f"Firebase service account key not found: {credential_file}")

    cred = credentials.Certificate(str(credential_file))
    firebase_admin.initialize_app(cred)
