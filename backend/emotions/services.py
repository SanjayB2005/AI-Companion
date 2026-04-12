from typing import Any

import requests
from django.conf import settings


class EmotionServiceError(Exception):
    pass


def detect_facial_emotion(access_token: str, frame_base64: str, session_id: int | None = None) -> dict[str, Any]:
    payload = {
        'frame_base64': frame_base64,
        'session_id': str(session_id) if session_id else None,
    }

    response = requests.post(
        f"{settings.EMOTION_SERVICE_URL}/api/v1/emotions/detect",
        json=payload,
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=settings.EMOTION_SERVICE_TIMEOUT,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = {'error': response.text}
        raise EmotionServiceError(str(detail))

    return response.json()


def detect_facial_emotion_detailed(access_token: str, frame_base64: str) -> dict[str, Any]:
    payload = {
        'frame_base64': frame_base64,
    }

    response = requests.post(
        f"{settings.EMOTION_SERVICE_URL}/api/v1/emotions/detect-detailed",
        json=payload,
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=settings.EMOTION_SERVICE_TIMEOUT,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = {'error': response.text}
        raise EmotionServiceError(str(detail))

    return response.json()
