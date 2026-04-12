import time

from fastapi import APIRouter, Header, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.responses import HTMLResponse

from app.core.auth import verify_access_token
from app.core.config import settings
from app.schemas.emotion import (
    DetectionRequest,
    DetectionResponse,
    DetailedDetectionResponse,
    WSErrorMessage,
    WSEmotionMessage,
    utc_now,
)
from app.services.facial_detector import facial_detector

router = APIRouter(prefix="/api/v1/emotions", tags=["emotions"])


def _extract_token_from_auth_header(authorization: str | None) -> str | None:
    if not authorization:
        return None

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1].strip()


@router.post("/detect", response_model=DetectionResponse)
def detect_emotion(
    payload: DetectionRequest,
    authorization: str | None = Header(default=None),
) -> DetectionResponse:
    token = _extract_token_from_auth_header(authorization)
    verify_access_token(token or "")

    try:
        result = facial_detector.predict(payload.frame_base64)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Emotion inference failed") from exc

    return DetectionResponse(
        emotion=result.emotion,
        confidence=result.confidence,
        face_detected=result.face_detected,
        detected_at=utc_now(),
        session_id=payload.session_id,
    )


@router.post("/detect-detailed", response_model=DetailedDetectionResponse)
def detect_emotion_detailed(
        payload: DetectionRequest,
        authorization: str | None = Header(default=None),
) -> DetailedDetectionResponse:
        token = _extract_token_from_auth_header(authorization)
        verify_access_token(token or "")

        try:
                result = facial_detector.predict(payload.frame_base64)
        except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        except Exception as exc:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Emotion inference failed") from exc

        return DetailedDetectionResponse(
                emotion=result.emotion,
                confidence=result.confidence,
                emotion_scores=result.emotion_scores,
                face_detected=result.face_detected,
                detected_at=utc_now(),
                session_id=payload.session_id,
        )


@router.get("/debug/web", response_class=HTMLResponse)
def debug_facial_web() -> str:
        return """
<!doctype html>
<html>
<head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
    <title>Facial Emotion Debug</title>
    <style>
        body { font-family: sans-serif; margin: 24px; }
        .card { max-width: 680px; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
        .row { margin: 12px 0; }
        pre { background: #f7f7f7; padding: 12px; border-radius: 8px; overflow: auto; }
    </style>
</head>
<body>
    <div class=\"card\">
        <h2>Facial Emotion Detection Debug</h2>
        <p>Upload one image and call detailed endpoint to inspect all emotion scores.</p>
        <div class=\"row\">
            <label>JWT Access Token</label><br />
            <input id=\"token\" style=\"width:100%\" placeholder=\"Bearer token without Bearer prefix\" />
        </div>
        <div class=\"row\">
            <input id=\"file\" type=\"file\" accept=\"image/*\" />
            <button onclick=\"submitImage()\">Analyze</button>
        </div>
        <pre id=\"output\">No result yet.</pre>
    </div>
    <script>
        async function toBase64(file) {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            return dataUrl.split(',')[1];
        }

        async function submitImage() {
            const fileInput = document.getElementById('file');
            const token = document.getElementById('token').value.trim();
            const output = document.getElementById('output');

            if (!fileInput.files.length) {
                output.textContent = 'Please choose an image.';
                return;
            }
            if (!token) {
                output.textContent = 'Please provide a JWT access token.';
                return;
            }

            const frameBase64 = await toBase64(fileInput.files[0]);
            const res = await fetch('/api/v1/emotions/detect-detailed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({ frame_base64: frameBase64 }),
            });
            const data = await res.json();
            output.textContent = JSON.stringify(data, null, 2);
        }
    </script>
</body>
</html>
"""


@router.websocket("/ws/live")
async def live_emotion_ws(websocket: WebSocket) -> None:
    await websocket.accept()

    token = websocket.query_params.get("token")

    if not token:
        auth_msg = await websocket.receive_json()
        if auth_msg.get("type") == "auth":
            token = auth_msg.get("token")

    try:
        verify_access_token(token or "")
    except HTTPException:
        await websocket.send_json(
            WSErrorMessage(
                code="UNAUTHORIZED",
                message="Invalid or missing access token",
            ).model_dump()
        )
        await websocket.close(code=1008)
        return

    await websocket.send_json({"type": "auth_ack", "message": "Authenticated"})

    last_inference_at = 0.0

    try:
        while True:
            message = await websocket.receive_json()
            msg_type = message.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong", "ts": utc_now().isoformat()})
                continue

            if msg_type != "frame":
                await websocket.send_json(
                    WSErrorMessage(
                        code="INVALID_MESSAGE",
                        message="Expected message type 'frame'",
                    ).model_dump()
                )
                continue

            now = time.monotonic()
            if now - last_inference_at < settings.min_frame_interval_seconds:
                await websocket.send_json(
                    WSErrorMessage(
                        code="THROTTLED",
                        message="Frame rate too high",
                    ).model_dump()
                )
                continue
            last_inference_at = now

            frame_payload = message.get("frame_base64")
            if not frame_payload:
                await websocket.send_json(
                    WSErrorMessage(
                        code="BAD_FRAME",
                        message="frame_base64 is required",
                    ).model_dump()
                )
                continue

            try:
                result = facial_detector.predict(frame_payload)
            except ValueError as exc:
                await websocket.send_json(
                    WSErrorMessage(
                        code="BAD_FRAME",
                        message=str(exc),
                    ).model_dump()
                )
                continue
            except Exception:
                await websocket.send_json(
                    WSErrorMessage(
                        code="INFERENCE_FAILED",
                        message="Emotion inference failed",
                    ).model_dump()
                )
                continue

            response = WSEmotionMessage(
                emotion=result.emotion,
                confidence=result.confidence,
                detected_at=utc_now(),
                frame_id=message.get("frame_id"),
                session_id=message.get("session_id"),
                face_detected=result.face_detected,
            )
            await websocket.send_json(response.model_dump(mode="json"))

    except WebSocketDisconnect:
        return
