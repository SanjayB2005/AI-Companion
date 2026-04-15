from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SpeechSession

User = get_user_model()


class SpeechApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='speech@test.com',
            username='speech-user',
            password='testpass123',
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_start_and_end_session(self):
        start_response = self.client.post('/api/speech/sessions/start/', {'include_audio': True}, format='json')
        self.assertEqual(start_response.status_code, status.HTTP_201_CREATED)
        session_id = start_response.data['session']['id']

        end_response = self.client.post(f'/api/speech/sessions/{session_id}/end/', {}, format='json')
        self.assertEqual(end_response.status_code, status.HTTP_200_OK)

    @patch('speech.views.transcribe_audio')
    def test_transcribe_proxy(self, mock_transcribe):
        mock_transcribe.return_value = {'text': 'hello', 'language': 'en', 'confidence': 0.9}
        response = self.client.post('/api/speech/transcribe/', {'audio_base64': 'ZmFrZQ==', 'format': 'wav'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['text'], 'hello')

    @patch('speech.views.realtime_test')
    def test_realtime_test_updates_session(self, mock_pipeline):
        session = SpeechSession.objects.create(user=self.user)
        mock_pipeline.return_value = {
            'transcript': 'I feel worried',
            'fused_emotion': 'Concerned',
            'response_text': 'I am here with you.',
        }

        response = self.client.post(
            '/api/speech/test/realtime/',
            {'audio_base64': 'ZmFrZQ==', 'format': 'wav', 'session_id': session.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        session.refresh_from_db()
        self.assertEqual(session.last_detected_emotion, 'Concerned')
