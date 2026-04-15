from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.main import get_conversation_service, get_whisper_service, get_ollama_client
from app.schemas import ChatResponse, ChatTextRequest
from app.services.llm_ollama import LLMServiceError


router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
def health(ollama=Depends(get_ollama_client)) -> dict:
    return {
        "ok": True,
        "ollama_reachable": ollama.health(),
    }


@router.post("/chat/text", response_model=ChatResponse)
def chat_text(payload: ChatTextRequest, conversation=Depends(get_conversation_service)) -> ChatResponse:
    try:
        result = conversation.respond(payload.message, payload.with_voice)
    except LLMServiceError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Text chat failed: local LLM backend unavailable or incompatible. "
                f"{exc}"
            ),
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Text chat failed: {exc}") from exc

    audio_url = f"/static/generated/{result.ai_audio_path.name}" if result.ai_audio_path else None
    return ChatResponse(
        user_text=result.user_text,
        ai_text=result.ai_text,
        ai_audio_url=audio_url,
        detected_emotion=result.detected_emotion,
        response_source=result.response_source,
    )


@router.post("/chat/speech", response_model=ChatResponse)
def chat_speech(
    audio: UploadFile = File(...),
    with_voice: bool = Form(False),
    whisper=Depends(get_whisper_service),
    conversation=Depends(get_conversation_service),
) -> ChatResponse:
    suffix = Path(audio.filename or "recording.webm").suffix or ".webm"
    temp_file = Path("tmp/uploads") / f"speech_{uuid.uuid4().hex}{suffix}"

    try:
        user_text = whisper.transcribe_file(audio.file, temp_file)
        result = conversation.respond(user_text, with_voice)
    except LLMServiceError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Speech chat failed: local LLM backend unavailable or incompatible. "
                f"{exc}"
            ),
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Speech chat failed: {exc}") from exc
    finally:
        if temp_file.exists():
            temp_file.unlink(missing_ok=True)

    audio_url = f"/static/generated/{result.ai_audio_path.name}" if result.ai_audio_path else None
    return ChatResponse(
        user_text=result.user_text,
        ai_text=result.ai_text,
        ai_audio_url=audio_url,
        detected_emotion=result.detected_emotion,
        response_source=result.response_source,
    )
