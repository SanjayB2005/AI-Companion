from django.conf import settings
from django.db import models


class ConversationSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversation_sessions",
    )
    title = models.CharField(max_length=255, blank=True)
    last_detected_emotion = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]


class ConversationMessage(models.Model):
    class Sender(models.TextChoices):
        USER = "user", "User"
        AI = "ai", "AI"

    session = models.ForeignKey(
        ConversationSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversation_messages",
    )
    sender = models.CharField(max_length=8, choices=Sender.choices)
    text = models.TextField()
    modality = models.CharField(max_length=32, default="text")
    detected_emotion = models.CharField(max_length=64, blank=True)
    detected_confidence = models.FloatField(null=True, blank=True)
    ai_emotion = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
