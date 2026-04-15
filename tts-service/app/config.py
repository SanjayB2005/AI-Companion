import os
from dataclasses import dataclass
from pathlib import Path


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_name: str = "Local AI Companion Service"
    app_host: str = os.getenv("APP_HOST", "127.0.0.1")
    app_port: int = int(os.getenv("APP_PORT", "8000"))

    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    ollama_timeout_sec: int = int(os.getenv("OLLAMA_TIMEOUT_SEC", "120"))
    enable_local_fallback: bool = _env_bool("ENABLE_LOCAL_FALLBACK", False)

    whisper_model: str = os.getenv("WHISPER_MODEL", "base")
    uploads_dir: Path = Path(os.getenv("UPLOADS_DIR", "tmp/uploads"))

    tts_output_dir: Path = Path(os.getenv("TTS_OUTPUT_DIR", "static/generated"))
    tts_rate: int = int(os.getenv("TTS_RATE", "180"))


settings = Settings()
settings.uploads_dir.mkdir(parents=True, exist_ok=True)
settings.tts_output_dir.mkdir(parents=True, exist_ok=True)
