from __future__ import annotations


class EmotionDetector:
    """Simple emotion detection based on keyword matching and text patterns."""

    POSITIVE_KEYWORDS = {
        "great",
        "awesome",
        "excellent",
        "love",
        "happy",
        "wonderful",
        "fantastic",
        "amazing",
        "brilliant",
        "thank",
        "thanks",
        "grateful",
        "appreciate",
        "good",
        "nice",
        "perfect",
        "cool",
        "sweet",
    }

    NEGATIVE_KEYWORDS = {
        "hate",
        "angry",
        "upset",
        "sad",
        "depressed",
        "frustrated",
        "annoyed",
        "disappointed",
        "terrible",
        "awful",
        "bad",
        "horrible",
        "stupid",
        "dumb",
        "useless",
        "stuck",
        "problem",
        "issue",
        "error",
        "failed",
        "fail",
        "wrong",
        "broken",
    }

    CURIOUS_KEYWORDS = {
        "how",
        "what",
        "why",
        "when",
        "where",
        "can you",
        "could you",
        "would you",
        "help",
        "explain",
        "tell me",
        "show me",
        "teach",
        "learn",
        "know",
        "understand",
    }

    def detect(self, text: str) -> str:
        """
        Detect emotion from text. Returns one of: happy, sad, curious, neutral.
        """
        text_lower = text.lower()

        positive_count = sum(1 for word in self.POSITIVE_KEYWORDS if word in text_lower)
        negative_count = sum(1 for word in self.NEGATIVE_KEYWORDS if word in text_lower)
        curious_count = sum(1 for word in self.CURIOUS_KEYWORDS if word in text_lower)

        # Exclamation marks and caps boost positive emotion
        if text.count("!") > 1:
            positive_count += 2
        if len(text) > 5 and text[0].isupper() and len([c for c in text if c.isupper()]) > len(text) * 0.3:
            positive_count += 1

        # Question marks boost curious
        if "?" in text:
            curious_count += 1

        # Determine dominant emotion
        if negative_count > positive_count and negative_count > curious_count:
            return "sad"
        elif positive_count > negative_count and positive_count > curious_count:
            return "happy"
        elif curious_count > max(positive_count, negative_count):
            return "curious"
        else:
            return "neutral"
