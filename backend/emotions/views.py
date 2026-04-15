from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EmotionSession
from .serializers import DetectEmotionDetailedSerializer, DetectEmotionSerializer, EmotionSessionSerializer
from .services import (
    EmotionServiceError,
    detect_facial_emotion,
    detect_facial_emotion_detailed,
    end_emotion_session as end_remote_emotion_session,
    start_emotion_session as start_remote_emotion_session,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_emotion_session(request):
    with transaction.atomic():
        session = EmotionSession.objects.create(user=request.user)

        try:
            start_remote_emotion_session(session.id)
        except EmotionServiceError as exc:
            session.delete()
            return Response(
                {'error': 'Emotion service unavailable', 'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    return Response(
        {
            'session': EmotionSessionSerializer(session).data,
            'message': 'Emotion session started',
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_emotion_session(request, session_id: int):
    try:
        session = EmotionSession.objects.get(id=session_id, user=request.user)
    except EmotionSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        end_remote_emotion_session(session.id)
    except EmotionServiceError as exc:
        return Response(
            {'error': 'Emotion service unavailable', 'detail': str(exc)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if session.session_end is None:
        session.session_end = timezone.now()
        session.save(update_fields=['session_end'])

    return Response(
        {
            'session': EmotionSessionSerializer(session).data,
            'message': 'Emotion session ended',
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_facial_emotion_view(request):
    serializer = DetectEmotionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    session = None
    session_id = serializer.validated_data.get('session_id')
    if session_id is not None:
        try:
            session = EmotionSession.objects.get(id=session_id, user=request.user)
        except EmotionSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    access_token = str(request.auth)

    try:
        detection = detect_facial_emotion(
            access_token=access_token,
            frame_base64=serializer.validated_data['frame_base64'],
            session_id=session.id if session else None,
        )
    except EmotionServiceError as exc:
        return Response(
            {'error': 'Emotion service unavailable', 'detail': str(exc)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if session is not None:
        session.face_emotion = detection.get('emotion', '')
        confidence = detection.get('confidence')
        session.confidence_score = round(float(confidence or 0.0), 2)
        session.save(update_fields=['face_emotion', 'confidence_score'])

    return Response(
        {
            'detection': detection,
            'session_id': session.id if session else None,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_emotion_sessions(request):
    sessions = EmotionSession.objects.filter(user=request.user).order_by('-created_at')[:50]
    data = EmotionSessionSerializer(sessions, many=True).data
    return Response({'sessions': data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def detect_facial_emotion_detailed_view(request):
    serializer = DetectEmotionDetailedSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    access_token = str(request.auth)
    try:
        detection = detect_facial_emotion_detailed(
            access_token=access_token,
            frame_base64=serializer.validated_data['frame_base64'],
        )
    except EmotionServiceError as exc:
        return Response(
            {'error': 'Emotion service unavailable', 'detail': str(exc)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({'detection': detection}, status=status.HTTP_200_OK)
