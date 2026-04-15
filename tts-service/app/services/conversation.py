from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app.config import settings
from app.services.llm_ollama import OllamaClient
from app.services.llm_ollama import LLMServiceError
from app.services.tts_pyttsx3 import Pyttsx3Service
from app.services.emotion_detector import EmotionDetector


ROCKY_SYSTEM_PROMPT = """You are Rocky, a smart, supportive Female AI assistant designed to help users stay productive and focused. You are always working on something interesting and are genuinely interested in what the user is doing.

Your nicknames which the user may call you are: "Rock", "Rocky", "Ro", "RJ"

**Your goals:**
- Help users stay productive and focused on a variety of tasks.
- Encourage smart work, learning, and project progress in any area the user is interested in.
- Assist users with any topic of interest - tech, personal projects, general knowledge, or learning.
- Always make very, very short and simple responses.
- Be very concise by default but offer longer responses only when truly necessary.

**Your behavior:**
- Be concise, friendly, and technically accurate when needed.
- Avoid fluff, but never omit important information.
- Match the user's tone: casual when appropriate and technical when needed.
- You are the user's reliable partner in learning, building, staying productive, and tackling everyday tasks.

**Avoid:**
- Generating long monologues responses unless the topic absolutely requires it.

Remember: You are Rocky, a supportive, intelligent, and concise AI companion."""

EMOTION_PROMPTS = {
    "happy": "The user seems happy! Respond with enthusiasm and positive energy to match their mood.",
    "sad": "The user seems upset or sad. Be extra supportive, empathetic, and encouraging.",
    "curious": "The user is curious and asking questions. Be helpful, clear, and educational.",
    "neutral": "Respond naturally and helpfully.",
}

TONE_PROMPTS = {
    "empathetic": "Respond with a gentle, compassionate, and validating tone.",
    "supportive": "Respond with steady encouragement and practical support.",
    "calm": "Respond with a calm, grounded, and reassuring tone.",
    "curious": "Respond with a curious, thoughtful, and explanatory tone.",
    "celebratory": "Respond with warm, upbeat, and positive energy.",
    "reassuring": "Respond with a soothing, reassuring, and safe tone.",
    "attentive": "Respond with careful attention and a balanced tone.",
    "neutral": "Respond naturally and helpfully.",
}


@dataclass
class ConversationResult:
    user_text: str
    ai_text: str
    ai_audio_path: Optional[Path] = None
    detected_emotion: str = "neutral"
    response_tone: str = "neutral"
    tone_reason: str = ""
    response_source: str = "llm"


class ConversationService:
    def __init__(self, llm: OllamaClient, tts: Pyttsx3Service) -> None:
        self.llm = llm
        self.tts = tts
        self.emotion_detector = EmotionDetector()

    def respond(
        self,
        user_text: str,
        with_voice: bool,
        tone_hint: str | None = None,
        tone_reason: str | None = None,
        facial_emotion: str | None = None,
        audio_emotion: str | None = None,
    ) -> ConversationResult:
        # Detect emotion from user input
        detected_emotion = self.emotion_detector.detect(user_text)
        emotion_context = EMOTION_PROMPTS.get(detected_emotion, EMOTION_PROMPTS["neutral"])
        response_tone = (tone_hint or self._tone_from_emotion(detected_emotion)).strip().lower()
        tone_context = TONE_PROMPTS.get(response_tone, TONE_PROMPTS["neutral"])

        fusion_context = []
        if facial_emotion:
            fusion_context.append(f"Facial expression: {facial_emotion}")
        if audio_emotion:
            fusion_context.append(f"Audio emotion: {audio_emotion}")
        if tone_reason:
            fusion_context.append(f"Fusion reason: {tone_reason}")

        # Build prompt with Rocky persona, tone guidance, and user message.
        prompt_parts = [
            ROCKY_SYSTEM_PROMPT,
            f"Response tone: {tone_context}",
            "Priority rule: favor the meaning of the text when face or voice cues conflict.",
        ]
        if fusion_context:
            prompt_parts.append(" | ".join(fusion_context))
        prompt_parts.extend([
            emotion_context,
            f"User: {user_text}",
            "Rocky:",
        ])
        prompt = "\n\n".join(prompt_parts)
        response_source = "llm"
        try:
            ai_text = self.llm.generate(prompt)
        except LLMServiceError:
            if settings.enable_local_fallback:
                # Optional resilience mode when external LLM is down.
                ai_text = self._local_fallback_reply(user_text, detected_emotion)
                response_source = "fallback"
            else:
                raise

        audio_path = self.tts.synthesize(ai_text) if with_voice else None
        return ConversationResult(
            user_text=user_text,
            ai_text=ai_text,
            ai_audio_path=audio_path,
            detected_emotion=detected_emotion,
            response_tone=response_tone,
            tone_reason=tone_reason or "",
            response_source=response_source,
        )

    @staticmethod
    def _tone_from_emotion(detected_emotion: str) -> str:
        mapping = {
            "sad": "empathetic",
            "happy": "celebratory",
            "curious": "curious",
            "neutral": "neutral",
        }
        return mapping.get(detected_emotion, "neutral")

    @staticmethod
    def _local_fallback_reply(user_text: str, detected_emotion: str) -> str:
        text = (user_text or "").strip()
        if not text:
            return "I am here. Tell me what you want to work on next."

        lowered = text.lower()

        if any(greet in lowered for greet in ("hi", "hello", "hey")):
            return "Hi. I am here and ready to help. What should we tackle first?"

        if "?" in text:
            if detected_emotion == "curious":
                return "Great question. Share a bit more context and I will give a clear step-by-step answer."
            return "Good question. Give me a little context and I will help you solve it quickly."

        if detected_emotion == "sad":
            return "That sounds heavy. Let us take one small next step together right now."

        if detected_emotion == "happy":
            return "Love that energy. Want to turn it into a quick win on your current task?"

        return "I got you. Tell me your goal and constraints, and I will suggest the best next step."
