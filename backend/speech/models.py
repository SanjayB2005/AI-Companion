from django.conf import settings
from django.db import models


class SpeechSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='speech_sessions',
    )
    is_audio_response_enabled = models.BooleanField(default=False)
    last_transcript = models.TextField(blank=True)
    last_detected_emotion = models.CharField(max_length=50, blank=True)
    last_response_text = models.TextField(blank=True)
    session_start = models.DateTimeField(auto_now_add=True)
    session_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'speech_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f'SpeechSession(id={self.id}, user={self.user_id})'
