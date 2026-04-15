from __future__ import annotations

import threading
import uuid
from pathlib import Path

import pyttsx3


class Pyttsx3Service:
    def __init__(self, output_dir: Path, rate: int = 180) -> None:
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.rate = rate
        self._lock = threading.Lock()
        self._female_voice_id = self._find_female_voice()

    def _find_female_voice(self) -> str | None:
        """Find and cache a female voice ID from available voices."""
        try:
            engine = pyttsx3.init()
            voices = engine.getProperty("voices")
            engine.quit()

            # Prefer voices with female/woman in name, or take second voice (often female)
            for voice in voices:
                if any(
                    keyword in voice.name.lower() for keyword in ["female", "woman", "zira", "victoria", "susan"]
                ):
                    return voice.id
            # Fallback: if available, use second voice (often female on systems)
            if len(voices) > 1:
                return voices[1].id
            return None
        except Exception:
            return None

    def synthesize(self, text: str) -> Path:
        if not text.strip():
            raise ValueError("Cannot synthesize empty text")

        output_file = self.output_dir / f"reply_{uuid.uuid4().hex}.wav"

        with self._lock:
            engine = pyttsx3.init()
            engine.setProperty("rate", self.rate)

            # Set female voice if available
            if self._female_voice_id:
                engine.setProperty("voice", self._female_voice_id)

            engine.save_to_file(text, str(output_file))
            engine.runAndWait()
            engine.stop()

        if not output_file.exists():
            raise RuntimeError("TTS output file was not generated")
        return output_file
