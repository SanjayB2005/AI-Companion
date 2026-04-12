import base64
from dataclasses import dataclass
from typing import Tuple

import cv2
import numpy as np


EMOTION_MAP = {
    "happy": "Happy",
    "sad": "Concerned",
    "angry": "Concerned",
    "fear": "Concerned",
    "surprise": "Thoughtful",
    "neutral": "Neutral",
    "disgust": "Concerned",
}


@dataclass
class EmotionResult:
    emotion: str
    confidence: float
    face_detected: bool
    emotion_scores: dict[str, float]


class FacialEmotionDetector:
    def __init__(self) -> None:
        self._deepface_available = False
        self._deepface = None
        try:
            from deepface import DeepFace  # pylint: disable=import-outside-toplevel

            self._deepface = DeepFace
            self._deepface_available = True
        except Exception:
            self._deepface_available = False

    def decode_base64_image(self, frame_base64: str) -> np.ndarray:
        if "," in frame_base64:
            frame_base64 = frame_base64.split(",", 1)[1]

        try:
            frame_bytes = base64.b64decode(frame_base64)
        except Exception as exc:
            raise ValueError("Invalid base64 frame payload") from exc

        np_arr = np.frombuffer(frame_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Could not decode image from payload")

        return image

    def _analyze_with_deepface(self, image: np.ndarray) -> Tuple[str, float, bool, dict[str, float]]:
        analysis = self._deepface.analyze(
            img_path=image,
            actions=["emotion"],
            enforce_detection=False,
            silent=True,
        )

        if isinstance(analysis, list):
            analysis = analysis[0]

        dominant_raw = str(analysis.get("dominant_emotion", "neutral")).lower()
        emotion_scores = analysis.get("emotion", {}) or {}
        normalized_scores = {
            EMOTION_MAP.get(str(name).lower(), str(name).title()): max(0.0, min(1.0, float(score) / 100.0))
            for name, score in emotion_scores.items()
        }
        score = float(emotion_scores.get(dominant_raw, 0.0))

        emotion = EMOTION_MAP.get(dominant_raw, "Neutral")
        confidence = max(0.0, min(1.0, score / 100.0))

        region = analysis.get("region", {}) or {}
        face_detected = bool(region.get("w", 0) and region.get("h", 0))

        if emotion not in normalized_scores:
            normalized_scores[emotion] = confidence

        return emotion, confidence, face_detected, normalized_scores

    def _fallback_estimate(self, image: np.ndarray) -> Tuple[str, float, bool, dict[str, float]]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))

        if brightness > 150:
            return "Happy", 0.35, True, {
                "Happy": 0.35,
                "Calm": 0.20,
                "Thoughtful": 0.20,
                "Neutral": 0.15,
                "Concerned": 0.10,
            }
        if brightness < 70:
            return "Concerned", 0.35, True, {
                "Happy": 0.10,
                "Calm": 0.15,
                "Thoughtful": 0.20,
                "Neutral": 0.20,
                "Concerned": 0.35,
            }
        return "Neutral", 0.30, True, {
            "Happy": 0.15,
            "Calm": 0.20,
            "Thoughtful": 0.20,
            "Neutral": 0.30,
            "Concerned": 0.15,
        }

    def predict(self, frame_base64: str) -> EmotionResult:
        image = self.decode_base64_image(frame_base64)

        if self._deepface_available:
            emotion, confidence, face_detected, emotion_scores = self._analyze_with_deepface(image)
        else:
            emotion, confidence, face_detected, emotion_scores = self._fallback_estimate(image)

        return EmotionResult(
            emotion=emotion,
            confidence=confidence,
            face_detected=face_detected,
            emotion_scores=emotion_scores,
        )


facial_detector = FacialEmotionDetector()
