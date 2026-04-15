import base64
import binascii
from typing import Any

import requests
from django.conf import settings


class SpeechServiceError(Exception):
    pass


def _auth_headers(access_token: str) -> dict[str, str]:
    return {'Authorization': f'Bearer {access_token}'}


def _to_absolute_audio_url(audio_url: str | None) -> str | None:
    if not audio_url:
        return None
    if audio_url.startswith('http://') or audio_url.startswith('https://'):
        return audio_url
    return f"{settings.TTS_STT_SERVICE_URL}{audio_url}" if audio_url.startswith('/') else f"{settings.TTS_STT_SERVICE_URL}/{audio_url}"


def _strip_data_uri_prefix(audio_base64: str) -> str:
    if ',' in audio_base64 and audio_base64.strip().lower().startswith('data:'):
        return audio_base64.split(',', 1)[1]
    return audio_base64


def _call_speech_service(path: str, access_token: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = requests.post(
        f"{settings.TTS_STT_SERVICE_URL}{path}",
        json=payload,
        headers=_auth_headers(access_token),
        timeout=settings.TTS_STT_SERVICE_TIMEOUT,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = {'error': response.text}
        raise SpeechServiceError(str(detail))

    return response.json()


def transcribe_audio(access_token: str, payload: dict[str, Any]) -> dict[str, Any]:
    audio_base64 = _strip_data_uri_prefix(payload['audio_base64'])
    file_format = payload.get('format', 'webm')

    try:
        raw_audio = base64.b64decode(audio_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise SpeechServiceError('Invalid base64 audio payload') from exc

    files = {
        'audio': (f"recording.{file_format}", raw_audio, 'application/octet-stream'),
    }
    data = {'with_voice': 'false'}

    response = requests.post(
        f"{settings.TTS_STT_SERVICE_URL}/api/chat/speech",
        files=files,
        data=data,
        headers=_auth_headers(access_token),
        timeout=settings.TTS_STT_SERVICE_TIMEOUT,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = {'error': response.text}
        raise SpeechServiceError(str(detail))

    result = response.json()
    return {
        'text': result.get('user_text', ''),
        'detected_emotion': result.get('detected_emotion', 'neutral'),
    }


def detect_text_emotion(access_token: str, payload: dict[str, Any]) -> dict[str, Any]:
    result = _call_speech_service(
        '/api/chat/text',
        access_token,
        {
            'message': payload['text'],
            'with_voice': False,
        },
    )

    return {
        'emotion': result.get('detected_emotion', 'neutral'),
    }


def generate_response(access_token: str, payload: dict[str, Any]) -> dict[str, Any]:
    result = _call_speech_service(
        '/api/chat/text',
        access_token,
        {
            'message': payload['user_message'],
            'with_voice': payload.get('include_audio', False),
        },
    )

    audio_url = _to_absolute_audio_url(result.get('ai_audio_url'))
    return {
        'user_text': result.get('user_text', payload['user_message']),
        'response_text': result.get('ai_text', ''),
        'detected_emotion': result.get('detected_emotion', payload.get('detected_emotion', 'neutral')),
        'audio_url': audio_url,
        'ai_audio_url': audio_url,
        'response_source': result.get('response_source', 'llm'),
    }


def realtime_test(access_token: str, payload: dict[str, Any]) -> dict[str, Any]:
    audio_result = transcribe_audio(access_token, payload)
    generated = generate_response(
        access_token,
        {
            'user_message': audio_result.get('text', ''),
            'detected_emotion': audio_result.get('detected_emotion', 'neutral'),
            'include_audio': payload.get('include_audio', False),
        },
    )

    return {
        'transcript': audio_result.get('text', ''),
        'fused_emotion': generated.get('detected_emotion', 'neutral'),
        'response_text': generated.get('response_text', ''),
        'audio_url': generated.get('audio_url'),
    }


def synthesize(access_token: str, payload: dict[str, Any]) -> dict[str, Any]:
    result = _call_speech_service(
        '/api/chat/text',
        access_token,
        {
            'message': payload['text'],
            'with_voice': True,
        },
    )

    audio_url = _to_absolute_audio_url(result.get('ai_audio_url'))
    return {
        'text': payload['text'],
        'audio_url': audio_url,
        'ai_audio_url': audio_url,
    }
