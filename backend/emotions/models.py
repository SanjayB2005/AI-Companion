from django.conf import settings
from django.db import models


class EmotionSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='emotion_sessions',
    )
    session_start = models.DateTimeField(auto_now_add=True)
    session_end = models.DateTimeField(null=True, blank=True)
    face_emotion = models.CharField(max_length=50, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emotion_sessions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'EmotionSession(id={self.id}, user={self.user_id})'
