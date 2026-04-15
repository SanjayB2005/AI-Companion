from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import cv2
import numpy as np
from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fer.fer import FER
from pydantic import BaseModel


DEFAULT_MODEL_ROOT = Path(r"D:\Projects\AI-Companion\faceEmotion-service")
STATIC_DIR = Path(__file__).resolve().parent / "static"


@dataclass
class EmotionSession:
    id: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: datetime | None = None
    prediction_count: int = 0
    last_emotion: str | None = None
    last_confidence: float | None = None


class StartSessionRequest(BaseModel):
    session_id: str | None = None


class EmotionModelService:
    def __init__(self, model_root: Path) -> None:
        self.model_root = model_root
        self._detector_lock = threading.Lock()
        try:
            self.detector = FER(mtcnn=True)
            self.detector_name = "FER(mtcnn=True)"
        except Exception:
            self.detector = FER(mtcnn=False)
            self.detector_name = "FER(mtcnn=False)"

    def predict_from_bytes(self, image_bytes: bytes) -> dict[str, Any]:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Unable to decode image bytes. Please send a valid JPEG/PNG frame.")

        with self._detector_lock:
            faces = self.detector.detect_emotions(frame)

        if not faces:
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "faces_detected": 0,
                "all_emotions": {},
            }

        best_face = max(
            faces,
            key=lambda face: max(face.get("emotions", {}).values() or [0.0]),
        )
        emotions = best_face.get("emotions", {})
        dominant_emotion = max(emotions, key=emotions.get)
        confidence = float(emotions[dominant_emotion])

        return {
            "emotion": dominant_emotion,
            "confidence": round(confidence, 4),
            "faces_detected": len(faces),
            "all_emotions": {k: round(float(v), 4) for k, v in emotions.items()},
        }


app = FastAPI(title="Face Emotion Test Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


model_root = DEFAULT_MODEL_ROOT if DEFAULT_MODEL_ROOT.exists() else Path(__file__).resolve().parent
model_service = EmotionModelService(model_root=model_root)
sessions: dict[str, EmotionSession] = {}
sessions_lock = threading.Lock()


def _session_or_404(session_id: str) -> EmotionSession:
    with sessions_lock:
        session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/", response_model=None)
def root():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)

    return {
        "service": "face-emotion-test",
        "status": "ok",
        "model_root": str(model_service.model_root),
        "detector": model_service.detector_name,
    }


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "model_root": str(model_service.model_root),
        "detector": model_service.detector_name,
        "active_sessions": len(sessions),
    }


@app.post("/emotions/sessions/start/")
def start_session(payload: StartSessionRequest | None = Body(default=None)) -> dict[str, Any]:
    session_id = (payload.session_id.strip() if payload and payload.session_id else str(uuid4()))
    session = EmotionSession(id=session_id)

    with sessions_lock:
        sessions[session_id] = session

    return {
        "session": {
            "id": session.id,
            "created_at": session.created_at.isoformat(),
            "prediction_count": session.prediction_count,
        },
        "message": "Emotion session started",
    }


@app.post("/emotions/sessions/{session_id}/predict/")
async def predict_emotion(
    session_id: str,
    image: UploadFile = File(...),
    min_confidence: float = Form(0.0),
) -> dict[str, Any]:
    session = _session_or_404(session_id)

    content_type = (image.content_type or "").lower()
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image payload is empty")

    try:
        prediction = model_service.predict_from_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    confidence = float(prediction["confidence"])
    emotion = prediction["emotion"] if confidence >= min_confidence else "neutral"

    with sessions_lock:
        session.prediction_count += 1
        session.last_emotion = emotion
        session.last_confidence = confidence

    return {
        "session_id": session.id,
        "emotion": emotion,
        "confidence": confidence,
        "faces_detected": prediction["faces_detected"],
        "all_emotions": prediction["all_emotions"],
        "prediction_count": session.prediction_count,
    }


@app.post("/emotions/sessions/{session_id}/end/")
def end_session(session_id: str) -> dict[str, Any]:
    with sessions_lock:
        session = sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        session.ended_at = datetime.now(timezone.utc)
        session_data = {
            "id": session.id,
            "created_at": session.created_at.isoformat(),
            "ended_at": session.ended_at.isoformat(),
            "prediction_count": session.prediction_count,
            "last_emotion": session.last_emotion,
            "last_confidence": session.last_confidence,
        }

    return {
        "session": session_data,
        "message": "Emotion session ended",
    }
