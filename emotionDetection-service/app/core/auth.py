from dataclasses import dataclass
import json
from urllib import request as urllib_request
from urllib.error import URLError, HTTPError

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.core.config import settings


@dataclass
class AuthUser:
    user_id: int
    token_type: str


def _extract_unverified_claims(token: str) -> dict:
    try:
        return jwt.get_unverified_claims(token)
    except Exception:
        return {}


def _verify_with_django(token: str) -> bool:
    payload = json.dumps({"token": token}).encode("utf-8")
    req = urllib_request.Request(
        settings.django_verify_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib_request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except (HTTPError, URLError):
        return False


def verify_access_token(token: str) -> AuthUser:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    payload = {}
    decoded_locally = False
    try:
        payload = jwt.decode(
            token,
            settings.django_secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"verify_aud": False},
        )
        decoded_locally = True
    except JWTError:
        # Fallback for environments where FastAPI doesn't share Django signing key.
        # We ask Django to verify signature/expiry and use unverified claims only for routing context.
        if not _verify_with_django(token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        payload = _extract_unverified_claims(token)

    user_id = payload.get("user_id")
    token_type = payload.get("token_type")

    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    if token_type != "access" and decoded_locally:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token required")

    if token_type != "access" and not decoded_locally:
        # If claims are unavailable/untrusted, keep behavior conservative.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token required")

    return AuthUser(user_id=int(user_id), token_type=token_type)
