from fastapi import HTTPException
from sqlmodel import Session, select

from src.models import User
from src.users import UserRead

"""
Fetch the db in order to return a UserRead from a given firebase uuid
"""


def get_user_by_firebase_uid(session: Session, firebase_uid: str) -> UserRead:
    statement = select(User).where(User.firebase_uid == firebase_uid)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.steam_id:
        raise HTTPException(status_code=500, detail="User Steam ID not found")

    return UserRead.model_validate(user)
