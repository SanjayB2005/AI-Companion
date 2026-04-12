from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class DetectionRequest(BaseModel):
    frame_base64: str = Field(..., description="Base64 JPEG/PNG frame")
    session_id: Optional[str] = None


class DetectionResponse(BaseModel):
    emotion: str
    confidence: float
    detected_at: datetime
    session_id: Optional[str] = None
    face_detected: bool = True


class DetailedDetectionResponse(DetectionResponse):
    emotion_scores: dict[str, float]


class WSAuthMessage(BaseModel):
    type: str = "auth"
    token: str


class WSFrameMessage(BaseModel):
    type: str = "frame"
    frame_base64: str
    frame_id: Optional[str] = None
    session_id: Optional[str] = None


class WSEmotionMessage(BaseModel):
    type: str = "emotion"
    emotion: str
    confidence: float
    detected_at: datetime
    frame_id: Optional[str] = None
    session_id: Optional[str] = None
    face_detected: bool = True


class WSErrorMessage(BaseModel):
    type: str = "error"
    code: str
    message: str


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
