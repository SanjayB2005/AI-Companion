from __future__ import annotations

from functools import lru_cache

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.services.conversation import ConversationService
from app.services.llm_ollama import OllamaClient
from app.services.stt_whisper import WhisperService
from app.services.tts_pyttsx3 import Pyttsx3Service


@lru_cache(maxsize=1)
def get_ollama_client() -> OllamaClient:
    return OllamaClient(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        timeout_sec=settings.ollama_timeout_sec,
    )


@lru_cache(maxsize=1)
def get_whisper_service() -> WhisperService:
    return WhisperService(settings.whisper_model)


@lru_cache(maxsize=1)
def get_tts_service() -> Pyttsx3Service:
    return Pyttsx3Service(output_dir=settings.tts_output_dir, rate=settings.tts_rate)


@lru_cache(maxsize=1)
def get_conversation_service() -> ConversationService:
    return ConversationService(llm=get_ollama_client(), tts=get_tts_service())


app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {"message": "Open /static/index.html to use the test UI."}


app.mount("/static", StaticFiles(directory="static"), name="static")

# Import routes after app dependencies are defined to avoid circular import issues.
from app.api.routes import router  # noqa: E402

app.include_router(router)
