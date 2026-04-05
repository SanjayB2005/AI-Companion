from rest_framework import serializers

from .models import ConversationMessage, ConversationSession


class FaceEmotionRequestSerializer(serializers.Serializer):
    image = serializers.ImageField(required=False)
    image_base64 = serializers.CharField(required=False, allow_blank=False)

    def validate(self, attrs):
        if not attrs.get('image') and not attrs.get('image_base64'):
            raise serializers.ValidationError(
                'Provide either image (multipart) or image_base64 (base64 string).'
            )
        return attrs


class TextChatRequestSerializer(serializers.Serializer):
    text = serializers.CharField(required=True, max_length=2000)
    session_id = serializers.IntegerField(required=False)


class VoiceChatRequestSerializer(serializers.Serializer):
    audio = serializers.FileField(required=True)
    session_id = serializers.IntegerField(required=False)


class ConversationMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationMessage
        fields = [
            'id',
            'sender',
            'text',
            'modality',
            'detected_emotion',
            'detected_confidence',
            'ai_emotion',
            'created_at',
        ]


class ConversationSessionSerializer(serializers.ModelSerializer):
    messages = ConversationMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ConversationSession
        fields = [
            'id',
            'title',
            'last_detected_emotion',
            'created_at',
            'updated_at',
            'messages',
        ]
