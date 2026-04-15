from typing import Optional

from pydantic import BaseModel, Field


class ChatTextRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    with_voice: bool = False


class ChatResponse(BaseModel):
    user_text: str
    ai_text: str
    ai_audio_url: Optional[str] = None
    detected_emotion: Optional[str] = None
    response_source: Optional[str] = None


class ErrorResponse(BaseModel):
    detail: str
