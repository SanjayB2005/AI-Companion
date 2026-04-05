import os
import tempfile
import uuid
from pathlib import Path

from django.conf import settings


_WHISPER_MODEL = None


def _get_whisper_model():
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        hf_token = getattr(settings, 'HF_TOKEN', '')
        if hf_token:
            os.environ.setdefault('HF_TOKEN', hf_token)

        if getattr(settings, 'HF_HUB_DISABLE_SYMLINKS_WARNING', True):
            os.environ.setdefault('HF_HUB_DISABLE_SYMLINKS_WARNING', '1')

        try:
            from faster_whisper import WhisperModel
        except Exception as exc:
            raise RuntimeError(
                'Whisper backend is not available. Install faster-whisper and its runtime dependencies.'
            ) from exc

        model_size = getattr(settings, 'WHISPER_MODEL_SIZE', 'base')
        device = getattr(settings, 'WHISPER_DEVICE', 'cpu')
        compute_type = getattr(settings, 'WHISPER_COMPUTE_TYPE', 'int8')
        _WHISPER_MODEL = WhisperModel(model_size, device=device, compute_type=compute_type)

    return _WHISPER_MODEL


def transcribe_uploaded_audio(uploaded_file):
    suffix = Path(uploaded_file.name or 'voice.wav').suffix or '.wav'
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        model = _get_whisper_model()
        segments, info = model.transcribe(temp_path, vad_filter=True)
        transcript = ' '.join(segment.text.strip() for segment in segments if segment.text).strip()
        language = getattr(info, 'language', '') or ''
        return transcript, language
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


def synthesize_speech_to_file(text):
    try:
        import pyttsx3
    except Exception as exc:
        raise RuntimeError('TTS backend is not available. Install pyttsx3.') from exc

    output_dir = Path(settings.MEDIA_ROOT) / 'voice_responses'
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = f"tts_{uuid.uuid4().hex}.wav"
    output_path = output_dir / filename

    engine = pyttsx3.init()
    rate = getattr(settings, 'TTS_RATE', 180)
    volume = getattr(settings, 'TTS_VOLUME', 1.0)
    engine.setProperty('rate', rate)
    engine.setProperty('volume', volume)
    engine.save_to_file(text, str(output_path))
    engine.runAndWait()

    return f"voice_responses/{filename}"
