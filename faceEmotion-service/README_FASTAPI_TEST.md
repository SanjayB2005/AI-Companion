# Face Emotion FastAPI Test Service

Standalone local service for testing live facial emotion predictions with webcam frames.

## Location
Model/service folder: `D:\Projects\AI-Companion\faceEmotion-service`

## Endpoints
- `POST /emotions/sessions/start/`
- `POST /emotions/sessions/{session_id}/predict/`
  - multipart form-data:
    - `image`: webcam frame (JPEG/PNG)
    - `min_confidence` (optional, float)
- `POST /emotions/sessions/{session_id}/end/`
- `GET /api/health`

## Run
```powershell
cd D:\Projects\AI-Companion\faceEmotion-service
.\venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8010 --reload
```

## Test UI
Open:
- `http://127.0.0.1:8010/`

The UI will:
1. Start a session
2. Open webcam
3. Send frames to predict endpoint
4. Display predicted emotion and confidence
5. End session

## Notes
- No auth is required.
- This service is independent and not integrated with main backend/mobile yet.
- API contract mirrors your backend session structure for future integration.
