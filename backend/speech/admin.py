from django.contrib import admin

from .models import SpeechSession


@admin.register(SpeechSession)
class SpeechSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'last_detected_emotion', 'session_start', 'session_end')
    search_fields = ('user__email', 'last_detected_emotion')
