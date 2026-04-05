import base64
import io
from pathlib import Path
import sys

from django.conf import settings
from PIL import Image
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from EmotionDetector.inference import (
    detect_largest_face,
    load_model,
    predict_emotion,
    resolve_model_path,
)

from .audio_services import synthesize_speech_to_file, transcribe_uploaded_audio
from .chat_services import analyze_text_emotion, generate_companion_response
from .models import ConversationMessage, ConversationSession

from .serializers import (
    ConversationMessageSerializer,
    ConversationSessionSerializer,
    FaceEmotionRequestSerializer,
    TextChatRequestSerializer,
    VoiceChatRequestSerializer,
)

_MODEL = None


def _load_model_once():
    global _MODEL
    if _MODEL is None:
        model_path = Path(resolve_model_path(settings.EMOTION_MODEL_PATH))
        if not model_path.exists():
            raise FileNotFoundError(f'Emotion model not found at {model_path}')
        _MODEL = load_model(str(model_path))
    return _MODEL


def _decode_base64_image(encoded_image: str):
    raw = encoded_image
    if ',' in encoded_image:
        raw = encoded_image.split(',', 1)[1]

    image_bytes = base64.b64decode(raw)
    pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return pil_image


def _resolve_or_create_session(user, session_id, title_seed):
    if session_id:
        session = ConversationSession.objects.filter(id=session_id, user=user).first()
        if session is None:
            return None
        return session

    return ConversationSession.objects.create(
        user=user,
        title=(title_seed[:60] + '...') if len(title_seed) > 60 else title_seed,
    )


def _build_media_url(request, relative_media_path):
    clean_media_url = settings.MEDIA_URL if settings.MEDIA_URL.endswith('/') else f"{settings.MEDIA_URL}/"
    relative_path = relative_media_path.replace('\\', '/')
    return request.build_absolute_uri(f"{clean_media_url}{relative_path}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_face_emotion(request):
    serializer = FaceEmotionRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        image_file = serializer.validated_data.get('image')
        image_base64 = serializer.validated_data.get('image_base64')

        if image_file:
            image_array = Image.open(image_file).convert('RGB')
        else:
            image_array = _decode_base64_image(image_base64)

        face = detect_largest_face(image_array)
        if face is None:
            return Response(
                {
                    'face_detected': False,
                    'message': 'No face detected in frame.',
                },
                status=status.HTTP_200_OK,
            )

        prediction = predict_emotion(_load_model_once(), face)

        return Response(
            {
                'face_detected': True,
                'emotion': prediction['emotion'],
                'confidence': prediction['confidence'],
                'probabilities': prediction['probabilities'],
            },
            status=status.HTTP_200_OK,
        )
    except FileNotFoundError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as exc:
        return Response(
            {'detail': f'Emotion detection failed: {str(exc)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_text(request):
    serializer = TextChatRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    text = serializer.validated_data['text'].strip()
    session_id = serializer.validated_data.get('session_id')

    if not text:
        return Response({'detail': 'Text cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

    session = _resolve_or_create_session(request.user, session_id, text)
    if session is None:
        return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    detected_emotion, confidence = analyze_text_emotion(text)
    session.last_detected_emotion = detected_emotion
    session.save(update_fields=['last_detected_emotion', 'updated_at'])

    user_message = ConversationMessage.objects.create(
        session=session,
        user=request.user,
        sender=ConversationMessage.Sender.USER,
        text=text,
        modality='text',
        detected_emotion=detected_emotion,
        detected_confidence=confidence,
    )

    companion_output = generate_companion_response(
        user_text=text,
        detected_emotion=detected_emotion,
    )

    ai_message = ConversationMessage.objects.create(
        session=session,
        sender=ConversationMessage.Sender.AI,
        text=companion_output.text,
        modality='text',
        ai_emotion=companion_output.ai_emotion,
    )

    return Response(
        {
            'session_id': session.id,
            'detected_emotion': {
                'emotion': detected_emotion,
                'confidence': confidence,
            },
            'user_message': ConversationMessageSerializer(user_message).data,
            'ai_message': ConversationMessageSerializer(ai_message).data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history(request):
    session_id = request.query_params.get('session_id')
    if session_id:
        session = ConversationSession.objects.filter(id=session_id, user=request.user).first()
        if session is None:
            return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ConversationSessionSerializer(session).data, status=status.HTTP_200_OK)

    sessions = ConversationSession.objects.filter(user=request.user)[:10]
    data = ConversationSessionSerializer(sessions, many=True).data
    return Response({'sessions': data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_voice(request):
    serializer = VoiceChatRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    audio_file = serializer.validated_data['audio']
    session_id = serializer.validated_data.get('session_id')

    try:
        transcript, language = transcribe_uploaded_audio(audio_file)
    except RuntimeError as exc:
        return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        return Response({'detail': f'Voice transcription failed: {str(exc)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    transcript = (transcript or '').strip()
    if not transcript:
        return Response(
            {'detail': 'Could not transcribe speech from audio.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    session = _resolve_or_create_session(request.user, session_id, transcript)
    if session is None:
        return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    detected_emotion, confidence = analyze_text_emotion(transcript)
    session.last_detected_emotion = detected_emotion
    session.save(update_fields=['last_detected_emotion', 'updated_at'])

    user_message = ConversationMessage.objects.create(
        session=session,
        user=request.user,
        sender=ConversationMessage.Sender.USER,
        text=transcript,
        modality='voice',
        detected_emotion=detected_emotion,
        detected_confidence=confidence,
    )

    companion_output = generate_companion_response(
        user_text=transcript,
        detected_emotion=detected_emotion,
    )

    tts_audio_url = ''
    tts_error = ''
    try:
        relative_audio_path = synthesize_speech_to_file(companion_output.text)
        tts_audio_url = _build_media_url(request, relative_audio_path)
    except RuntimeError as exc:
        tts_error = str(exc)
    except Exception as exc:
        tts_error = f'TTS generation failed: {str(exc)}'

    ai_message = ConversationMessage.objects.create(
        session=session,
        sender=ConversationMessage.Sender.AI,
        text=companion_output.text,
        modality='voice',
        ai_emotion=companion_output.ai_emotion,
    )

    return Response(
        {
            'session_id': session.id,
            'transcript': transcript,
            'language': language,
            'detected_emotion': {
                'emotion': detected_emotion,
                'confidence': confidence,
            },
            'tts_audio_url': tts_audio_url,
            'tts_error': tts_error,
            'user_message': ConversationMessageSerializer(user_message).data,
            'ai_message': ConversationMessageSerializer(ai_message).data,
        },
        status=status.HTTP_200_OK,
    )
