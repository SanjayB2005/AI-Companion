from rest_framework import serializers

from .models import EmotionSession


class EmotionSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionSession
        fields = [
            'id',
            'user',
            'session_start',
            'session_end',
            'face_emotion',
            'confidence_score',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'session_start', 'created_at']


class DetectEmotionSerializer(serializers.Serializer):
    frame_base64 = serializers.CharField()
    session_id = serializers.IntegerField(required=False)


class DetectEmotionDetailedSerializer(serializers.Serializer):
    frame_base64 = serializers.CharField()
