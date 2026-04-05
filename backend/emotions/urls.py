from django.urls import path

from .views import chat_history, chat_text, chat_voice, detect_face_emotion

urlpatterns = [
    path('detect-face/', detect_face_emotion, name='detect-face-emotion'),
    path('chat/text/', chat_text, name='chat-text'),
    path('chat/voice/', chat_voice, name='chat-voice'),
    path('chat/history/', chat_history, name='chat-history'),
]
