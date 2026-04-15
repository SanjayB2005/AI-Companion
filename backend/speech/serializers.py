from rest_framework import serializers

from .models import SpeechSession


class SpeechSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpeechSession
        fields = [
            'id',
            'user',
            'is_audio_response_enabled',
            'last_transcript',
            'last_detected_emotion',
            'last_response_text',
            'session_start',
            'session_end',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'session_start', 'created_at']


class StartSpeechSessionSerializer(serializers.Serializer):
    include_audio = serializers.BooleanField(default=False)


class TranscribeSerializer(serializers.Serializer):
    audio_base64 = serializers.CharField()
    format = serializers.CharField(default='webm')
    language = serializers.CharField(default='en', required=False)


class EmotionTextSerializer(serializers.Serializer):
    text = serializers.CharField()


class GenerateSerializer(serializers.Serializer):
    user_message = serializers.CharField()
    detected_emotion = serializers.CharField()
    facial_emotion = serializers.CharField(required=False, allow_blank=True)
    audio_emotion = serializers.CharField(required=False, allow_blank=True)
    include_audio = serializers.BooleanField(default=False)


class SynthesizeSerializer(serializers.Serializer):
    text = serializers.CharField()
    voice_rate = serializers.IntegerField(default=175)


class RealtimeTestSerializer(serializers.Serializer):
    audio_base64 = serializers.CharField()
    format = serializers.CharField(default='webm')
    include_audio = serializers.BooleanField(default=False)
    session_id = serializers.IntegerField(required=False)
    facial_emotion = serializers.CharField(required=False, allow_blank=True)
