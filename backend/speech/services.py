import base64
import binascii
from typing import Any

import requests
from django.conf import settings


class SpeechServiceError(Exception):
    pass


GRIEF_WORDS = {
    'died',
    'dead',
    'death',
    'loss',
    'passed away',
    'grief',
    'mourning',
    'funeral',
    'gone',
    'lost',
}

SUPPORT_WORDS = {
    'sad',
    'upset',
    'hurt',
    'worried',
    'anxious',
    'stressed',
    'overwhelmed',
    'angry',
    'frustrated',
    'scared',
    'confused',
    'nervous',
}

POSITIVE_WORDS = {
    'happy',
    'great',
    'awesome',
    'love',
    'wonderful',
    'amazing',
    'good',
    'excited',
    'proud',
    'relieved',
    'joy',
    'celebrate',
}

QUESTION_WORDS = {
    'how',
    'what',
    'why',
    'when',
    'where',
    'can you',
    'could you',
    'would you',
    'help me',
    'explain',
    'tell me',
}

FACE_TONE_MAP = {
    'sad': ('empathetic', 0.85),
    'angry': ('calm', 0.8),
    'fear': ('reassuring', 0.75),
    'disgust': ('calm', 0.7),
    'happy': ('celebratory', 0.8),
    'surprise': ('attentive', 0.6),
    'neutral': ('neutral', 0.4),
}

AUDIO_TONE_MAP = {
    'sad': ('empathetic', 0.8),
    'angry': ('calm', 0.85),
    'happy': ('celebratory', 0.75),
    'curious': ('curious', 0.7),
    'neutral': ('neutral', 0.35),
}


def _normalize_emotion_label(value: str | None) -> str:
    return (value or 'neutral').strip().lower()


def _apply_score(scores: dict[str, float], tone: str, weight: float) -> None:
    scores[tone] = scores.get(tone, 0.0) + weight


def resolve_response_tone(
    user_message: str,
    facial_emotion: str | None = None,
    audio_emotion: str | None = None,
) -> dict[str, Any]:
    text = (user_message or '').strip()
    lowered = text.lower()

    scores: dict[str, float] = {
        'empathetic': 0.0,
        'supportive': 0.0,
        'calm': 0.0,
        'curious': 0.0,
        'celebratory': 0.0,
        'reassuring': 0.0,
        'attentive': 0.0,
        'neutral': 0.0,
    }
    reasons: list[str] = []

    if not text:
        return {
            'response_tone': 'neutral',
            'tone_reason': 'No user message was provided, so respond neutrally.',
            'tone_signals': {},
        }

    if any(word in lowered for word in GRIEF_WORDS):
        _apply_score(scores, 'empathetic', 4.0)
        _apply_score(scores, 'supportive', 2.5)
        _apply_score(scores, 'calm', 1.5)
        reasons.append('Text contains grief or loss language.')
    elif any(word in lowered for word in SUPPORT_WORDS):
        _apply_score(scores, 'supportive', 2.5)
        _apply_score(scores, 'calm', 1.5)
        _apply_score(scores, 'empathetic', 1.0)
        reasons.append('Text sounds distressed or difficult.')

    if any(word in lowered for word in POSITIVE_WORDS):
        _apply_score(scores, 'celebratory', 2.2)
        _apply_score(scores, 'supportive', 1.0)
        reasons.append('Text contains positive language.')

    if '?' in text or any(word in lowered for word in QUESTION_WORDS):
        _apply_score(scores, 'curious', 2.5)
        _apply_score(scores, 'attentive', 1.0)
        reasons.append('Text looks like a question or request for help.')

    if text.count('!') >= 2 or (text.isupper() and len(text) > 4):
        _apply_score(scores, 'calm', 1.4)
        _apply_score(scores, 'supportive', 0.8)
        reasons.append('Text uses strong emphasis, so the reply should stay grounded.')

    normalized_face = _normalize_emotion_label(facial_emotion)
    face_tone, face_weight = FACE_TONE_MAP.get(normalized_face, ('neutral', 0.0))
    if face_weight > 0:
        _apply_score(scores, face_tone, face_weight)
        if face_tone != 'neutral':
            reasons.append(f'Face suggests {normalized_face}.')

    normalized_audio = _normalize_emotion_label(audio_emotion)
    audio_tone, audio_weight = AUDIO_TONE_MAP.get(normalized_audio, ('neutral', 0.0))
    if audio_weight > 0:
        _apply_score(scores, audio_tone, audio_weight)
        if audio_tone != 'neutral':
            reasons.append(f'Voice suggests {normalized_audio}.')

    dominant_tone = max(scores, key=scores.get)
    dominant_score = scores[dominant_tone]
    if dominant_score <= 0:
        dominant_tone = 'neutral'

    tone_reason = '; '.join(reasons) if reasons else 'Signals are balanced, so respond neutrally.'
    if normalized_face and normalized_audio and normalized_face != normalized_audio:
        tone_reason += f' Faced with conflicting face and voice cues, prioritize the message meaning.'

    return {
        'response_tone': dominant_tone,
        'tone_reason': tone_reason,
        'tone_signals': {
            'text': text,
            'facial_emotion': normalized_face,
            'audio_emotion': normalized_audio,
            'scores': scores,
        },
    }


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
    facial_emotion = payload.get('facial_emotion') or payload.get('detected_facial_emotion')
    audio_emotion = payload.get('audio_emotion') or payload.get('detected_emotion')
    tone_context = resolve_response_tone(
        payload['user_message'],
        facial_emotion=facial_emotion,
        audio_emotion=audio_emotion,
    )

    result = _call_speech_service(
        '/api/chat/text',
        access_token,
        {
            'message': payload['user_message'],
            'with_voice': payload.get('include_audio', False),
            'facial_emotion': _normalize_emotion_label(facial_emotion),
            'audio_emotion': _normalize_emotion_label(audio_emotion),
            'tone_hint': tone_context['response_tone'],
            'tone_reason': tone_context['tone_reason'],
        },
    )

    audio_url = _to_absolute_audio_url(result.get('ai_audio_url'))
    return {
        'user_text': result.get('user_text', payload['user_message']),
        'response_text': result.get('ai_text', ''),
        'detected_emotion': result.get('detected_emotion', payload.get('detected_emotion', 'neutral')),
        'response_tone': result.get('response_tone', tone_context['response_tone']),
        'tone_reason': result.get('tone_reason', tone_context['tone_reason']),
        'tone_signals': tone_context['tone_signals'],
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
            'audio_emotion': audio_result.get('detected_emotion', 'neutral'),
            'facial_emotion': payload.get('facial_emotion'),
            'include_audio': payload.get('include_audio', False),
        },
    )

    return {
        'transcript': audio_result.get('text', ''),
        'fused_emotion': generated.get('response_tone', generated.get('detected_emotion', 'neutral')),
        'response_tone': generated.get('response_tone', 'neutral'),
        'tone_reason': generated.get('tone_reason', ''),
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
