from dataclasses import dataclass
from typing import Tuple

from decouple import config


_EMOTION_KEYWORDS = {
    "happy": ["happy", "great", "good", "excited", "joy", "awesome", "glad"],
    "sad": ["sad", "down", "depressed", "upset", "cry", "lonely", "hurt"],
    "anxious": ["anxious", "anxiety", "nervous", "worried", "panic", "stress"],
    "angry": ["angry", "mad", "frustrated", "annoyed", "hate", "furious"],
    "neutral": [],
}


@dataclass
class GeneratedCompanionResponse:
    text: str
    ai_emotion: str


def analyze_text_emotion(text: str) -> Tuple[str, float]:
    lowered = text.lower()
    best_emotion = "neutral"
    best_hits = 0

    for emotion, keywords in _EMOTION_KEYWORDS.items():
        if not keywords:
            continue
        hits = sum(1 for token in keywords if token in lowered)
        if hits > best_hits:
            best_hits = hits
            best_emotion = emotion

    confidence = 0.55 if best_emotion == "neutral" else min(0.95, 0.62 + best_hits * 0.1)
    return best_emotion, confidence


def _fallback_response(emotion: str, user_text: str) -> GeneratedCompanionResponse:
    templates = {
        "happy": (
            "I can feel positive energy in your message. I am happy for you. "
            "Would you like to share what is going well right now?",
            "supportive",
        ),
        "sad": (
            "I hear that this feels heavy for you. You are not alone right now, and we can walk through it together.",
            "empathetic",
        ),
        "anxious": (
            "That sounds overwhelming. Let us slow it down together, one step at a time.",
            "calming",
        ),
        "angry": (
            "I hear the frustration in what you shared. Your feelings are valid, and we can unpack this safely.",
            "grounded",
        ),
        "neutral": (
            "Thank you for sharing that with me. Tell me a little more so I can support you better.",
            "attentive",
        ),
    }
    text, ai_emotion = templates.get(emotion, templates["neutral"])
    return GeneratedCompanionResponse(text=text, ai_emotion=ai_emotion)


def _generate_with_gemini(user_text: str, detected_emotion: str) -> GeneratedCompanionResponse:
    api_key = config("GEMINI_API_KEY", default="")
    if not api_key:
        return _fallback_response(detected_emotion, user_text)

    try:
        import google.generativeai as genai
    except Exception:
        return _fallback_response(detected_emotion, user_text)

    try:
        genai.configure(api_key=api_key)
        model_name = config("GEMINI_MODEL", default="gemini-1.5-flash")
        model = genai.GenerativeModel(model_name=model_name)
        prompt = (
            "You are an empathetic AI companion. "
            "Respond in 2-3 short sentences, warm and supportive, without medical claims. "
            f"Detected user emotion: {detected_emotion}. "
            f"User message: {user_text}"
        )
        result = model.generate_content(prompt)
        generated = (result.text or "").strip()
        if not generated:
            return _fallback_response(detected_emotion, user_text)
        return GeneratedCompanionResponse(text=generated, ai_emotion="empathetic")
    except Exception:
        return _fallback_response(detected_emotion, user_text)


def generate_companion_response(user_text: str, detected_emotion: str) -> GeneratedCompanionResponse:
    return _generate_with_gemini(user_text=user_text, detected_emotion=detected_emotion)
