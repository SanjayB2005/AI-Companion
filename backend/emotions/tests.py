from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmotionSession

User = get_user_model()


class EmotionApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='emotion@test.com',
            username='emotion-user',
            password='testpass123',
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_start_and_list_sessions(self):
        start_response = self.client.post('/api/emotions/sessions/start/', {}, format='json')
        self.assertEqual(start_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('session', start_response.data)

        list_response = self.client.get('/api/emotions/sessions/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_response.data.get('sessions', [])), 1)

    def test_end_session(self):
        session = EmotionSession.objects.create(user=self.user)

        response = self.client.post(f'/api/emotions/sessions/{session.id}/end/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        session.refresh_from_db()
        self.assertIsNotNone(session.session_end)

    @patch('emotions.views.detect_facial_emotion')
    def test_detect_facial_emotion_updates_session(self, mock_detect):
        mock_detect.return_value = {
            'emotion': 'Happy',
            'confidence': 0.84,
            'detected_at': '2026-04-12T12:00:00Z',
            'face_detected': True,
        }

        session = EmotionSession.objects.create(user=self.user)

        payload = {
            'frame_base64': 'ZmFrZV9iYXNlNjQ=',
            'session_id': session.id,
        }
        response = self.client.post('/api/emotions/detect/facial/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detection', response.data)
        self.assertEqual(response.data['detection']['emotion'], 'Happy')

        session.refresh_from_db()
        self.assertEqual(session.face_emotion, 'Happy')
