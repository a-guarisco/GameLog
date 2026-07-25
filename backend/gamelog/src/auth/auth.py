from fastapi import Header, HTTPException, status
from firebase_admin import auth

from src.auth.schemas import AuthenticatedUser


def extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")

    return parts[1]


async def get_current_user(authorization: str | None = Header(default=None)) -> AuthenticatedUser:
    token = extract_bearer_token(authorization)

    try:
        decoded_token = auth.verify_id_token(token)
        return AuthenticatedUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            claims=decoded_token,
        )
    except Exception as e:
        print(f"DEBUG AUTH ERROR: {type(e).__name__}: {e}", flush=True)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid or expired Firebase ID token: {e}")
