from django.urls import path

from . import views

app_name = 'speech'

urlpatterns = [
    path('sessions/start/', views.start_speech_session, name='start-session'),
    path('sessions/<int:session_id>/end/', views.end_speech_session, name='end-session'),
    path('sessions/', views.list_speech_sessions, name='list-sessions'),
    path('transcribe/', views.transcribe_view, name='transcribe'),
    path('emotion/text/', views.emotion_text_view, name='emotion-text'),
    path('generate-response/', views.generate_response_view, name='generate-response'),
    path('synthesize/', views.synthesize_view, name='synthesize'),
    path('test/realtime/', views.realtime_test_view, name='realtime-test'),
]
