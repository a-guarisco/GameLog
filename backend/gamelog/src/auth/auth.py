from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from src.auth.schemas import AuthenticatedUser

security = HTTPBearer(auto_error=False)


def extract_bearer_token(
    credentials: HTTPAuthorizationCredentials | None = None,
    authorization: str | None = None,
) -> str:
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif authorization:
        parts = authorization.split(" ")
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    return token


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    authorization: str | None = Header(default=None),
) -> AuthenticatedUser:
    token = extract_bearer_token(credentials, authorization)

    try:
        decoded_token = auth.verify_id_token(token)
        return AuthenticatedUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            claims=decoded_token,
        )
    except Exception as e:
        print(f"DEBUG AUTH ERROR: {type(e).__name__}: {e}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {e}",
        )
