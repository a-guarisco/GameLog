

from collections import defaultdict
import uuid

from fastapi import HTTPException, status
from sqlmodel import Session, col, select

from src.auth.schemas import AuthenticatedUser
from src.community.schemas import CommunityGenreHour, CommunityScope
from src.models import Friendship, FriendshipStatus, Game, Genre, SteamRollingTime, User
from src.users import user_service


def get_community_genre(
    scope: CommunityScope,
    db: Session,
    user: AuthenticatedUser,
) -> list[CommunityGenreHour]:
    """
    Returns the percentage share of playtime for each genre for the specified community scope.
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)

    match scope:
        case CommunityScope.GLOBAL:
            target_user_ids = _get_global_user_ids(db)
        case CommunityScope.REGION:
            target_user_ids = _get_regional_user_ids(db, current_user)
        case CommunityScope.FRIENDS:
            target_user_ids = _get_friend_user_ids(db, current_user.id)
        case _:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid community scope: {scope}",
            )

    if not target_user_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No matching user found for community scope {scope}",
        )

    return _calculate_genre_percentages(db, target_user_ids)


def _get_global_user_ids(db: Session) -> list[uuid.UUID]:
    return list(db.exec(select(User.id)).all())


def _get_regional_user_ids(db: Session, user: User) -> list[uuid.UUID]:
    if not user.region or user.region.strip() == "" or user.region == "Unknown":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User region is not set",
        )
    return list(db.exec(select(User.id).where(User.region == user.region)).all())


def _get_friend_user_ids(db: Session, user_id: uuid.UUID) -> list[uuid.UUID]:
    friendships = db.exec(
        select(Friendship).where(
            ((Friendship.requester_id == user_id) | (Friendship.addressee_id == user_id))
            & (Friendship.status == FriendshipStatus.ACCEPTED)
        )
    ).all()

    friend_ids = {
        f.addressee_id if f.requester_id == user_id else f.requester_id
        for f in friendships
    }

    if not friend_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no friends",
        )

    return list(friend_ids)


def _calculate_genre_percentages(db: Session, target_user_ids: list[uuid.UUID]) -> list[CommunityGenreHour]:
    rolling_records = db.exec(
        select(SteamRollingTime)
        .where(col(SteamRollingTime.user_id).in_(target_user_ids))
        .order_by(col(SteamRollingTime.created_at).desc())
    ).all()

    latest_by_user_game: dict[tuple[uuid.UUID, str], int] = {}
    for record in rolling_records:
        key = (record.user_id, record.steam_app_id)
        if key not in latest_by_user_game:
            latest_by_user_game[key] = record.last_day_playtime

    app_playtimes: dict[str, int] = defaultdict(int)
    for (_, app_id), playtime in latest_by_user_game.items():
        if playtime > 0:
            app_playtimes[app_id] += playtime

    if not app_playtimes:
        return []

    played_app_ids = list(app_playtimes.keys())
    games = db.exec(
        select(Game).where(col(Game.steam_app_id).in_(played_app_ids))
    ).all()

    genre_playtime_minutes: dict[str, int] = defaultdict(int)
    genre_descriptions: dict[str, str] = {}

    for game in games:
        game_time = app_playtimes.get(game.steam_app_id, 0)
        for genre in game.genres:
            genre_playtime_minutes[genre.id] += game_time
            genre_descriptions[genre.id] = genre.description

    total_minutes_across_genres = sum(genre_playtime_minutes.values())
    if total_minutes_across_genres == 0:
        return []

    result = [
        CommunityGenreHour(
            id=genre_id,
            description=genre_descriptions[genre_id],
            percentage=round((minutes / total_minutes_across_genres) * 100.0, 2),
        )
        for genre_id, minutes in genre_playtime_minutes.items()
        if minutes > 0
    ]

    result.sort(key=lambda x: x.percentage, reverse=True)
    return result

