import base64
import binascii
import io
from typing import Any

import requests
from django.conf import settings


class EmotionServiceError(Exception):
    pass


def _strip_data_uri_prefix(frame_base64: str) -> str:
    if ',' in frame_base64 and frame_base64.strip().lower().startswith('data:'):
        return frame_base64.split(',', 1)[1]
    return frame_base64


def _decode_frame(frame_base64: str) -> bytes:
    try:
        return base64.b64decode(_strip_data_uri_prefix(frame_base64), validate=True)
    except (binascii.Error, ValueError) as exc:
        raise EmotionServiceError('Invalid base64 image payload') from exc


def _call_emotion_service(method: str, path: str, *, json: dict[str, Any] | None = None, files: dict[str, Any] | None = None, data: dict[str, Any] | None = None) -> dict[str, Any]:
    response = requests.request(
        method=method,
        url=f"{settings.EMOTION_SERVICE_URL}{path}",
        json=json,
        files=files,
        data=data,
        timeout=settings.EMOTION_SERVICE_TIMEOUT,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = {'error': response.text}
        raise EmotionServiceError(str(detail))

    return response.json()


def start_emotion_session(session_id: int) -> dict[str, Any]:
    return _call_emotion_service(
        'POST',
        '/emotions/sessions/start/',
        json={'session_id': str(session_id)},
    )


def end_emotion_session(session_id: int) -> dict[str, Any]:
    return _call_emotion_service('POST', f'/emotions/sessions/{session_id}/end/')


def detect_facial_emotion(access_token: str, frame_base64: str, session_id: int | None = None) -> dict[str, Any]:
    if session_id is None:
        raise EmotionServiceError('Emotion session id is required')

    image_bytes = _decode_frame(frame_base64)
    files = {
        'image': ('frame.jpg', io.BytesIO(image_bytes), 'image/jpeg'),
    }
    data = {'min_confidence': '0.0'}

    result = _call_emotion_service(
        'POST',
        f'/emotions/sessions/{session_id}/predict/',
        files=files,
        data=data,
    )

    return {
        'emotion': result.get('emotion', 'neutral'),
        'confidence': result.get('confidence', 0.0),
        'faces_detected': result.get('faces_detected', 0),
        'all_emotions': result.get('all_emotions', {}),
        'prediction_count': result.get('prediction_count', 0),
        'session_id': result.get('session_id', session_id),
    }


def detect_facial_emotion_detailed(access_token: str, frame_base64: str) -> dict[str, Any]:
    image_bytes = _decode_frame(frame_base64)
    files = {
        'image': ('frame.jpg', io.BytesIO(image_bytes), 'image/jpeg'),
    }
    data = {'min_confidence': '0.0'}

    result = _call_emotion_service('POST', '/emotions/sessions/start/')
    session_id = result['session']['id']
    try:
        prediction = _call_emotion_service(
            'POST',
            f'/emotions/sessions/{session_id}/predict/',
            files=files,
            data=data,
        )
    finally:
        try:
            _call_emotion_service('POST', f'/emotions/sessions/{session_id}/end/')
        except EmotionServiceError:
            pass

    return {
        'emotion': prediction.get('emotion', 'neutral'),
        'confidence': prediction.get('confidence', 0.0),
        'faces_detected': prediction.get('faces_detected', 0),
        'all_emotions': prediction.get('all_emotions', {}),
        'prediction_count': prediction.get('prediction_count', 0),
        'session_id': session_id,
    }
