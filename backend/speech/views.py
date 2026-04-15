from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SpeechSession
from .serializers import (
    EmotionTextSerializer,
    GenerateSerializer,
    RealtimeTestSerializer,
    SpeechSessionSerializer,
    SynthesizeSerializer,
    StartSpeechSessionSerializer,
    TranscribeSerializer,
)
from .services import (
    SpeechServiceError,
    detect_text_emotion,
    generate_response,
    realtime_test,
    synthesize,
    transcribe_audio,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_speech_session(request):
    serializer = StartSpeechSessionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    session = SpeechSession.objects.create(
        user=request.user,
        is_audio_response_enabled=serializer.validated_data['include_audio'],
    )

    ws_url = f"{request.scheme}://{request.get_host()}"
    ws_url = ws_url.replace('http://', 'ws://').replace('https://', 'wss://')

    return Response(
        {
            'session': SpeechSessionSerializer(session).data,
            'realtime': {
                'service_ws_url': f"{ws_url.replace(request.get_host(), settings_host())}/api/v1/speech/ws/realtime",
                'token_transport': 'query_or_auth_message',
                'audio_format': 'pcm16_mono_16000',
            },
        },
        status=status.HTTP_201_CREATED,
    )


def settings_host() -> str:
    from django.conf import settings

    return settings.TTS_STT_SERVICE_URL.replace('http://', '').replace('https://', '')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_speech_session(request, session_id: int):
    try:
        session = SpeechSession.objects.get(id=session_id, user=request.user)
    except SpeechSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    if session.session_end is None:
        session.session_end = timezone.now()
        session.save(update_fields=['session_end'])

    return Response({'session': SpeechSessionSerializer(session).data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_speech_sessions(request):
    sessions = SpeechSession.objects.filter(user=request.user)[:50]
    return Response({'sessions': SpeechSessionSerializer(sessions, many=True).data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transcribe_view(request):
    serializer = TranscribeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = transcribe_audio(str(request.auth), serializer.validated_data)
    except SpeechServiceError as exc:
        return Response({'error': 'Speech service unavailable', 'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def emotion_text_view(request):
    serializer = EmotionTextSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = detect_text_emotion(str(request.auth), serializer.validated_data)
    except SpeechServiceError as exc:
        return Response({'error': 'Speech service unavailable', 'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_response_view(request):
    serializer = GenerateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = generate_response(str(request.auth), serializer.validated_data)
    except SpeechServiceError as exc:
        return Response({'error': 'Speech service unavailable', 'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def synthesize_view(request):
    serializer = SynthesizeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = synthesize(str(request.auth), serializer.validated_data)
    except SpeechServiceError as exc:
        return Response({'error': 'Speech service unavailable', 'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def realtime_test_view(request):
    serializer = RealtimeTestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = realtime_test(str(request.auth), serializer.validated_data)
    except SpeechServiceError as exc:
        return Response({'error': 'Speech service unavailable', 'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    session_id = request.data.get('session_id')
    if session_id:
        try:
            session = SpeechSession.objects.get(id=session_id, user=request.user)
            session.last_transcript = result.get('transcript', '')
            session.last_detected_emotion = result.get('fused_emotion', '')
            session.last_response_text = result.get('response_text', '')
            session.save(update_fields=['last_transcript', 'last_detected_emotion', 'last_response_text'])
        except SpeechSession.DoesNotExist:
            pass

    return Response(result, status=status.HTTP_200_OK)
