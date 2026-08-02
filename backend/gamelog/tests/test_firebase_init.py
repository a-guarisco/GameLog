from unittest.mock import patch

from src.auth.firebase_init import initialize_firebase_app
from src.core.settings import Settings


def test_initialize_firebase_app_uses_emulator_without_service_account_key():
    with patch.dict(
        "os.environ",
        {
            "DATABASE_URL": "sqlite:///:memory:",
            "USE_FIREBASE_EMULATOR": "true",
            "FIREBASE_AUTH_EMULATOR_HOST": "127.0.0.1:9099",
            "GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH": "",
        },
        clear=True,
    ):
        settings = Settings()

        with (
            patch("src.auth.firebase_init.firebase_admin.get_app", side_effect=ValueError),
            patch("src.auth.firebase_init.firebase_admin.initialize_app") as mock_init,
        ):
            initialize_firebase_app(settings)

    mock_init.assert_called_once_with(options={"projectId": "gamelog-40e10"})
