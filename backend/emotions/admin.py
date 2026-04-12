from django.contrib import admin

from .models import EmotionSession


@admin.register(EmotionSession)
class EmotionSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'face_emotion', 'confidence_score', 'session_start', 'session_end')
    search_fields = ('user__email', 'face_emotion')
    list_filter = ('face_emotion', 'created_at')
