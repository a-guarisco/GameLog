from pydantic import BaseModel


class AchievementResponse(BaseModel):
    message: str
    status: str = "success"
