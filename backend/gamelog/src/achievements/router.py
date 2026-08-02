from fastapi import APIRouter

from .service import get_hello_message

router = APIRouter(prefix="/achievements", tags=["Achievements"])


@router.get("/helloAchievements")
def hello_world():
    return get_hello_message()
