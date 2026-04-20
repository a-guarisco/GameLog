from .schemas import AchievementResponse

def get_hello_message() -> AchievementResponse:
    return AchievementResponse(message="Hello, Achievements!")