from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(validation_alias="DATABASE_URL")
    firebase_service_account_key_path: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_APPLICATION_CREDENTIALS_HOST_PATH"),
    )
    use_firebase_emulator: bool = Field(default=True, validation_alias="USE_FIREBASE_EMULATOR")
    firebase_auth_emulator_host: str = Field(default="host.docker.internal:9099", validation_alias="FIREBASE_AUTH_EMULATOR_HOST")
    run_scheduler: bool = Field(default=True, validation_alias="RUN_SCHEDULER")
    app_name: str = "GameLog API"
    app_version: str = "0.1.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
