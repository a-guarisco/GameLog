from typing import Any

from pydantic import BaseModel, Field


class AuthenticatedUser(BaseModel):
    uid: str
    email: str | None = None
    claims: dict[str, Any] = Field(default_factory=dict)
