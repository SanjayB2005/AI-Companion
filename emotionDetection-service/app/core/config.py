from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Emotion Detection Service"
    app_version: str = "0.1.0"
    debug: bool = False

    django_secret_key: str = "django-insecure-dev-key-change-in-production"
    jwt_algorithm: str = "HS256"
    django_verify_url: str = "http://localhost:8000/api/token/verify/"

    max_frame_bytes: int = 2_000_000
    min_frame_interval_seconds: float = 0.3

    cors_allow_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
