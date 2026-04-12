import base64
import unittest

from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings
from app.main import app


class EmotionServiceTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def _access_token(self):
        payload = {
            'token_type': 'access',
            'user_id': 1,
        }
        return jwt.encode(payload, settings.django_secret_key, algorithm=settings.jwt_algorithm)

    def test_health(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('status'), 'ok')

    def test_detect_requires_auth(self):
        response = self.client.post('/api/v1/emotions/detect', json={'frame_base64': 'abc'})
        self.assertEqual(response.status_code, 401)

    def test_detect_success_with_patched_predict(self):
        from app.routes import emotions as emotions_route

        original_predict = emotions_route.facial_detector.predict

        def mock_predict(_frame):
            class Result:
                emotion = 'Neutral'
                confidence = 0.7
                face_detected = True

            return Result()

        emotions_route.facial_detector.predict = mock_predict
        try:
            token = self._access_token()
            response = self.client.post(
                '/api/v1/emotions/detect',
                json={'frame_base64': base64.b64encode(b'frame').decode('utf-8')},
                headers={'Authorization': f'Bearer {token}'},
            )
            self.assertEqual(response.status_code, 200)
            body = response.json()
            self.assertEqual(body.get('emotion'), 'Neutral')
            self.assertIn('confidence', body)
        finally:
            emotions_route.facial_detector.predict = original_predict


if __name__ == '__main__':
    unittest.main()
