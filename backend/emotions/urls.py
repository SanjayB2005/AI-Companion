from django.urls import path

from . import views

app_name = 'emotions'

urlpatterns = [
    path('sessions/start/', views.start_emotion_session, name='start-session'),
    path('sessions/<int:session_id>/end/', views.end_emotion_session, name='end-session'),
    path('sessions/', views.list_emotion_sessions, name='list-sessions'),
    path('detect/facial/', views.detect_facial_emotion_view, name='detect-facial'),
    path('detect/facial/detailed/', views.detect_facial_emotion_detailed_view, name='detect-facial-detailed'),
]
