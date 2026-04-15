from __future__ import annotations

from pathlib import Path
from typing import BinaryIO

import whisper


class WhisperService:
    def __init__(self, model_name: str) -> None:
        self.model = whisper.load_model(model_name)

    def transcribe_file(self, source_file: BinaryIO, destination: Path) -> str:
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("wb") as out:
            out.write(source_file.read())

        result = self.model.transcribe(str(destination))
        text = result.get("text", "").strip()
        if not text:
            raise RuntimeError("Whisper could not transcribe speech")
        return text
