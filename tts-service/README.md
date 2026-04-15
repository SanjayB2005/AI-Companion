# Local AI Companion (STT + TTS + Ollama)

A minimal local service for testing AI companion interactions with:
- Text input chat
- Microphone speech input (browser recording -> Whisper STT)
- Local LLM response using Ollama
- Optional AI voice response using pyttsx3

## Stack
- FastAPI backend
- Whisper (`openai-whisper`) for STT
- Ollama (`/api/generate`) for text generation
- pyttsx3 for offline TTS
- Plain HTML/CSS/JS test UI

## Prerequisites
1. Python 3.10+
2. Ollama running locally with a pulled model, e.g. `llama3.1:8b`
3. `ffmpeg` available in PATH (required by Whisper)

## Setup
```powershell
cd d:\Projects\tts-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:
- API root: `http://127.0.0.1:8000/`
- UI: `http://127.0.0.1:8000/static/index.html`

## Environment Variables
- `OLLAMA_BASE_URL` (default: `http://127.0.0.1:11434`)
- `OLLAMA_MODEL` (default: `llama3.1:8b`)
- `OLLAMA_TIMEOUT_SEC` (default: `120`)
- `WHISPER_MODEL` (default: `base`)
- `TTS_RATE` (default: `180`)

Example:
```powershell
$env:OLLAMA_MODEL = "llama3.1:8b"
uvicorn app.main:app --reload
```

## API Endpoints
- `GET /api/health`
- `POST /api/chat/text`
  - body: `{ "message": "hello", "with_voice": true }`
- `POST /api/chat/speech`
  - form-data: `audio` file + `with_voice` boolean

## Notes
- Browser microphone capture requires permission approval.
- TTS output audio files are written under `static/generated/`.
- First Whisper request may be slower while model loads.
