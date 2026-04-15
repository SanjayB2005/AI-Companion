from __future__ import annotations

from dataclasses import dataclass

import requests


class LLMServiceError(RuntimeError):
    """Raised when the configured LLM endpoint cannot serve a completion request."""


@dataclass
class OllamaClient:
    base_url: str
    model: str
    timeout_sec: int

    def generate(self, prompt: str) -> str:
        base = self.base_url.rstrip("/")
        model_name = self._resolve_model_name()

        endpoint_candidates = [
            (
                "/api/generate",
                {
                    "model": model_name,
                    "prompt": prompt,
                    "stream": False,
                },
                self._extract_generate_text,
            ),
            (
                "/api/chat",
                {
                    "model": model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                },
                self._extract_chat_text,
            ),
            (
                "/v1/chat/completions",
                {
                    "model": model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                },
                self._extract_openai_chat_text,
            ),
        ]

        endpoint_errors: list[str] = []

        for path, body, response_parser in endpoint_candidates:
            try:
                response = requests.post(
                    f"{base}{path}",
                    json=body,
                    timeout=self.timeout_sec,
                )
            except requests.RequestException as exc:
                endpoint_errors.append(f"{path}: network error ({exc})")
                continue

            if response.status_code == 404:
                endpoint_errors.append(f"{path}: not found (404)")
                continue

            if response.status_code >= 400:
                endpoint_errors.append(
                    f"{path}: HTTP {response.status_code} ({response.text[:200]})"
                )
                continue

            try:
                payload = response.json()
            except ValueError as exc:
                endpoint_errors.append(f"{path}: invalid JSON response ({exc})")
                continue

            text = response_parser(payload).strip()
            if text:
                return text

            endpoint_errors.append(f"{path}: empty text in response")

        raise LLMServiceError(
            "No compatible LLM completion endpoint found at "
            f"{self.base_url}. Tried /api/generate, /api/chat, /v1/chat/completions. "
            f"Details: {' | '.join(endpoint_errors)}"
        )

    def _resolve_model_name(self) -> str:
        available_models = self._list_available_models()
        if not available_models:
            return self.model

        if self.model in available_models:
            return self.model

        preferred_models = ["rocky:latest", "llama3.2:3b", "mistral:latest"]
        for preferred in preferred_models:
            if preferred in available_models:
                return preferred

        return available_models[0]

    def _list_available_models(self) -> list[str]:
        try:
            response = requests.get(f"{self.base_url.rstrip('/')}/api/tags", timeout=5)
        except requests.RequestException:
            return []

        if response.status_code >= 400:
            return []

        try:
            payload = response.json()
        except ValueError:
            return []

        model_entries = payload.get("models") or []
        names: list[str] = []
        for entry in model_entries:
            if isinstance(entry, dict):
                name = entry.get("name")
                if isinstance(name, str) and name.strip():
                    names.append(name.strip())

        return names

    def health(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.ok
        except Exception:
            return False

    @staticmethod
    def _extract_generate_text(payload: dict) -> str:
        return str(payload.get("response", ""))

    @staticmethod
    def _extract_chat_text(payload: dict) -> str:
        message = payload.get("message") or {}
        content = message.get("content")
        return str(content) if content is not None else ""

    @staticmethod
    def _extract_openai_chat_text(payload: dict) -> str:
        choices = payload.get("choices") or []
        if not choices:
            return ""

        first_choice = choices[0] if isinstance(choices[0], dict) else {}
        message = first_choice.get("message") or {}
        content = message.get("content")
        return str(content) if content is not None else ""
