from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Actor:
    user_id: str
    role: str


@lru_cache
def _jwks_client(url: str) -> PyJWKClient:
    return PyJWKClient(f"{url.rstrip('/')}/auth/v1/.well-known/jwks.json", cache_keys=True)


def verify_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
        if algorithm == "HS256" and settings.supabase_jwt_secret:
            claims = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                options={"require": ["exp", "sub"]},
            )
        elif settings.supabase_url and algorithm in {"RS256", "ES256"}:
            key = _jwks_client(settings.supabase_url).get_signing_key_from_jwt(token).key
            claims = jwt.decode(
                token,
                key,
                algorithms=[algorithm],
                audience="authenticated",
                options={"require": ["exp", "sub"]},
            )
        else:
            raise ValueError("No configured Supabase signing key supports this token")
    except (jwt.PyJWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTHENTICATION_REQUIRED", "message": "Invalid access token"},
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    return claims


def get_actor(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Actor:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTHENTICATION_REQUIRED", "message": "Bearer token required"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    claims = verify_access_token(credentials.credentials)
    app_metadata = claims.get("app_metadata")
    role = app_metadata.get("role", "traveler") if isinstance(app_metadata, dict) else "traveler"
    if role not in {"traveler", "operator", "coordinator", "admin", "vendor"}:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Invalid role"},
        )
    return Actor(user_id=claims["sub"], role=role)
