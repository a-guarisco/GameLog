from typing import Any

from pydantic import BaseModel, Field


class AuthenticatedUser(BaseModel):
    uid: str
    email: str | None = None
    email_verified: bool = False
    claims: dict[str, Any] = Field(default_factory=dict)
