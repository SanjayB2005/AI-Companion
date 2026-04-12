# Emotion Detection Service (FastAPI)

This service provides live facial emotion detection for the AI Companion app.

## Features
- JWT-authenticated facial emotion detection API
- HTTP snapshot endpoint for single frame inference
- WebSocket endpoint for live frame streaming
- DeepFace + OpenCV based emotion classification

## Endpoints
- `GET /health`
- `POST /api/v1/emotions/detect`
- `POST /api/v1/emotions/detect-detailed`
- `WS /api/v1/emotions/ws/live`
- `GET /api/v1/emotions/debug/web`

## Local Setup
1. Create and activate a Python virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy env template and update secret key:
   - `copy .env.example .env`
  - Ensure `DJANGO_VERIFY_URL` points to your Django backend token verify endpoint.
4. Run server:
   - `uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`

## HTTP Detect Payload
```json
{
  "frame_base64": "<base64_image>",
  "session_id": "123"
}
```

## WebSocket Message Format
Auth message (if token not sent via query `?token=`):
```json
{ "type": "auth", "token": "<jwt_access_token>" }
```

Frame message:
```json
{
  "type": "frame",
  "frame_base64": "<base64_image>",
  "frame_id": "frame-1",
  "session_id": "123"
}
```

Emotion response:
```json
{
  "type": "emotion",
  "emotion": "Happy",
  "confidence": 0.82,
  "detected_at": "2026-04-12T10:00:00+00:00",
  "frame_id": "frame-1",
  "session_id": "123",
  "face_detected": true
}
```
