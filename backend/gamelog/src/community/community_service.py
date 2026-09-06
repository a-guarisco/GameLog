import calendar
import uuid
from collections import defaultdict
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlmodel import Session, col, select

from src.auth.schemas import AuthenticatedUser
from src.community.schemas import (
    CommunityGameStatusItem,
    CommunityGameStatusResponse,
    CommunityGenreHour,
    CommunityMonthlyPlaytimeResponse,
    CommunityMonthlyTopGameResponse,
    CommunityScope,
    CommunityWeeklyPlaytimeResponse,
    CommunityWeeklyTopGameResponse,
    TopGameReference,
)
from src.community.sql import (
    get_community_daily_totals,
    get_community_game_totals_and_players,
    get_community_genre_totals,
)
from src.games import game_service
from src.games.schemas import DayByDayPlaytime
from src.models import (
    Friendship,
    FriendshipStatus,
    Game,
    GameStatus,
    Shelving,
    SteamRollingTime,
    User,
)
from src.users import user_service


def get_community_genre(
    scope: CommunityScope,
    db: Session,
    user: AuthenticatedUser,
    user_id: uuid.UUID | None = None,
) -> list[CommunityGenreHour]:
    """
    Returns the percentage share of playtime for each genre for the specified community scope.
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db, user_id=user_id)

    return _calculate_genre_percentages(db, target_user_ids)


def get_community_weekly_playtime(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    user_id: uuid.UUID | None = None,
) -> CommunityWeeklyPlaytimeResponse:
    """
    Return the weekly playtime comparison for the specified 7-day period (Monday to Sunday)
    comparing the user vs the community average (excluding the user).
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db, user_id=user_id)

    week_dates = [start_date + timedelta(days=i) for i in range(7)]

    user_daily_map = _get_user_daily_playtimes_map(db, current_user.id, end_date)
    user_hours = [round(user_daily_map.get(d, 0) / 60.0, 2) for d in week_dates]

    community_daily_map = get_community_daily_totals(db, target_user_ids, start_date, end_date)
    
    community_daily_totals = [community_daily_map.get(d, 0) for d in week_dates]

    num_target_users = len(target_user_ids)
    community_hours = [round(total_mins / (60.0 * num_target_users), 2) if num_target_users > 0 else 0.0 for total_mins in community_daily_totals]

    return CommunityWeeklyPlaytimeResponse(user=user_hours, community=community_hours)


def get_community_monthly_playtime(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    user_id: uuid.UUID | None = None,
) -> CommunityMonthlyPlaytimeResponse:
    """
    Return the month-by-month playtime comparison for the specified period
    comparing the user vs the community average (excluding the user).
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db, user_id=user_id)

    months: list[tuple[int, int]] = []
    cur_year = start_date.year
    cur_month = start_date.month
    while (cur_year < end_date.year) or (cur_year == end_date.year and cur_month <= end_date.month):
        months.append((cur_year, cur_month))
        cur_month += 1
        if cur_month > 12:
            cur_month = 1
            cur_year += 1

    user_daily_map = _get_user_daily_playtimes_map(db, current_user.id, end_date)

    community_daily_map = get_community_daily_totals(db, target_user_ids, start_date, end_date)

    user_hours: list[float] = []
    community_hours: list[float] = []
    num_target_users = len(target_user_ids)

    for y, m in months:
        last_day = calendar.monthrange(y, m)[1]
        days_in_month = [date(y, m, d) for d in range(1, last_day + 1)]

        user_month_mins = sum(user_daily_map.get(d, 0) for d in days_in_month)
        user_hours.append(round(user_month_mins / 60.0, 2))

        community_month_mins = sum(community_daily_map.get(d, 0) for d in days_in_month)
        community_hours.append(round(community_month_mins / (60.0 * num_target_users), 2) if num_target_users > 0 else 0.0)

    return CommunityMonthlyPlaytimeResponse(user=user_hours, community=community_hours)


def get_community_weekly_top_games(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    reference: TopGameReference = TopGameReference.COMMUNITY,
    user_id: uuid.UUID | None = None,
) -> list[CommunityWeeklyTopGameResponse]:
    """
    Return the user and community average playtime for the top games (up to 5)
    sorted by community or user playtime in the specified week.
    """
    week_dates = [start_date + timedelta(days=i) for i in range(7)]
    return _compute_community_top_games_for_dates(
        scope=scope,
        dates=week_dates,
        end_date=end_date,
        user=user,
        db=db,
        reference=reference,
        response_cls=CommunityWeeklyTopGameResponse,
        user_id=user_id,
    )


def get_community_monthly_top_games(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    reference: TopGameReference = TopGameReference.COMMUNITY,
    user_id: uuid.UUID | None = None,
) -> list[CommunityMonthlyTopGameResponse]:
    """
    Return the user and community average playtime for the top games (up to 5)
    sorted by community or user playtime in the specified month(s) period.
    """
    num_days = (end_date - start_date).days + 1
    period_dates = [start_date + timedelta(days=i) for i in range(num_days)]
    return _compute_community_top_games_for_dates(
        scope=scope,
        dates=period_dates,
        end_date=end_date,
        user=user,
        db=db,
        response_cls=CommunityMonthlyTopGameResponse,
        reference=reference,
        user_id=user_id,
    )


def get_community_game_statuses(
    scope: CommunityScope,
    user: AuthenticatedUser,
    db: Session,
    user_id: uuid.UUID | None = None,
) -> CommunityGameStatusResponse:
    """
    Return the game status breakdown (count and percentage) for the user vs the community average.
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db, user_id=user_id)

    user_shelvings = db.exec(select(Shelving).where(Shelving.owner_id == current_user.id)).all()
    user_counts: dict[GameStatus, int] = {s: 0 for s in GameStatus}
    for shelving in user_shelvings:
        user_counts[shelving.status] += 1

    user_num_of_games = len(user_shelvings)
    user_items = [
        CommunityGameStatusItem(
            status=status,
            count=float(user_counts[status]),
            percentage=round((user_counts[status] / user_num_of_games) * 100.0, 2) if user_num_of_games > 0 else 0.0,
        )
        for status in GameStatus
    ]

    community_shelvings = db.exec(select(Shelving).where(col(Shelving.owner_id).in_(target_user_ids))).all()
    num_target_users = len(target_user_ids)
    community_counts: dict[GameStatus, int] = {s: 0 for s in GameStatus}
    for shelving in community_shelvings:
        community_counts[shelving.status] += 1

    total_community_games = len(community_shelvings)
    community_num_of_games = round(total_community_games / num_target_users, 2) if num_target_users > 0 else 0.0

    community_items = [
        CommunityGameStatusItem(
            status=status,
            count=round(community_counts[status] / num_target_users, 2) if num_target_users > 0 else 0.0,
            percentage=round((community_counts[status] / total_community_games) * 100.0, 2) if total_community_games > 0 else 0.0,
        )
        for status in GameStatus
    ]

    return CommunityGameStatusResponse(
        user=user_items,
        community=community_items,
        user_num_of_games=user_num_of_games,
        community_num_of_games=community_num_of_games,
    )


def _compute_community_top_games_for_dates(
    scope: CommunityScope,
    dates: list[date],
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    response_cls: type,
    reference: TopGameReference,
    user_id: uuid.UUID | None = None,
) -> list:
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db, user_id=user_id)

    user_daily_game_map = _get_user_daily_game_playtimes_map(db, current_user.id, end_date)
    user_game_totals = _aggregate_game_playtimes_for_dates(user_daily_game_map, dates)

    # Use SQL helper to get all community top games in one fast query
    community_game_totals, community_game_player_counts = get_community_game_totals_and_players(
        db, 
        target_user_ids, 
        start_date=min(dates), 
        end_date=max(dates)
    )

    all_game_ids = set(user_game_totals.keys()) | set(community_game_totals.keys())

    candidates = []
    for app_id in all_game_ids:
        user_hours = round(user_game_totals.get(app_id, 0) / 60.0, 2)
        player_count = community_game_player_counts.get(app_id, 0)
        comm_hours = round(community_game_totals.get(app_id, 0) / (60.0 * player_count), 2) if player_count > 0 else 0.0
        if user_hours > 0 or comm_hours > 0:
            candidates.append(
                response_cls(
                    id=app_id,
                    user_playtime=user_hours,
                    community_playtime=comm_hours,
                )
            )

    if reference == TopGameReference.USER:
        candidates = [c for c in candidates if c.user_playtime > 0]
        candidates.sort(key=lambda x: (-x.user_playtime, -x.community_playtime, x.id))
    else:
        candidates.sort(key=lambda x: (-x.community_playtime, x.id))

    return candidates[:5]


def _get_user_daily_playtimes(db: Session, user_id: uuid.UUID, end_date: date) -> list[DayByDayPlaytime]:
    statement = (
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == user_id)
        .where(SteamRollingTime.created_at <= end_date)
        .order_by(col(SteamRollingTime.created_at))
    )
    records = db.exec(statement).all()
    if not records:
        return []
    return game_service.compute_daily_playtimes(records, days=-1, end_date=end_date)


def _get_user_daily_game_playtimes_map(db: Session, user_id: uuid.UUID, end_date: date) -> dict[date, dict[str, int]]:
    daily_playtimes = _get_user_daily_playtimes(db, user_id, end_date)
    daily_game_map: dict[date, dict[str, int]] = defaultdict(dict)
    for dp in daily_playtimes:
        for g in dp.games:
            if g.playtime_minutes > 0:
                daily_game_map[dp.date][g.app_id] = g.playtime_minutes
    return daily_game_map


def _aggregate_game_playtimes_for_dates(
    daily_game_map: dict[date, dict[str, int]],
    dates: list[date],
) -> dict[str, int]:
    totals: dict[str, int] = defaultdict(int)
    for d in dates:
        if d in daily_game_map:
            for app_id, mins in daily_game_map[d].items():
                totals[app_id] += mins
    return totals


def _get_user_daily_playtimes_map(db: Session, user_id: uuid.UUID, end_date: date) -> dict[date, int]:
    daily_playtimes = _get_user_daily_playtimes(db, user_id, end_date)
    return {dp.date: dp.playtime_minutes for dp in daily_playtimes}


def _compute_target_ids(
    scope: CommunityScope,
    current_user: User,
    db: Session,
    user_id: uuid.UUID | None = None,
) -> list[uuid.UUID]:
    match scope:
        case CommunityScope.GLOBAL:
            target_user_ids = _get_global_user_ids(db, current_user.id)
        case CommunityScope.REGION:
            target_user_ids = _get_regional_user_ids(db, current_user)
        case CommunityScope.FRIENDS:
            target_user_ids = _get_friend_user_ids(db, current_user.id)
        case CommunityScope.USER:
            target_user_ids = _get_single_target_user_id(db, current_user.id, user_id)
        case _:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid community scope: {scope}",
            )
    if len(target_user_ids) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No users found for scope {scope}",
        )
    return target_user_ids


def _get_single_target_user_id(
    db: Session,
    current_user_id: uuid.UUID,
    target_user_id: uuid.UUID | None,
) -> list[uuid.UUID]:
    if target_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id is required when scope is 'user'",
        )
    if target_user_id == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot compare with yourself",
        )
    target_user = db.get(User, target_user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    blocked_friendship = db.exec(
        select(Friendship).where(
            (Friendship.requester_id == target_user_id)
            & (Friendship.addressee_id == current_user_id)
            & (Friendship.status == FriendshipStatus.BLOCKED)
        )
    ).first()

    if blocked_friendship:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to user profile is blocked",
        )

    return [target_user_id]


def _get_global_user_ids(db: Session, exclude_user_id: uuid.UUID) -> list[uuid.UUID]:
    query = select(User.id).where(User.id != exclude_user_id)
    return list(db.exec(query).all())


def _get_regional_user_ids(db: Session, user: User) -> list[uuid.UUID]:
    if not user.region or user.region.strip() == "" or user.region == "Unknown":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User region is not set",
        )
    query = select(User.id).where(User.region == user.region).where(User.id != user.id)
    return list(db.exec(query).all())


def _get_friend_user_ids(db: Session, user_id: uuid.UUID) -> list[uuid.UUID]:
    friendships = db.exec(
        select(Friendship).where(
            ((Friendship.requester_id == user_id) | (Friendship.addressee_id == user_id)) & (Friendship.status == FriendshipStatus.ACCEPTED)
        )
    ).all()

    friend_ids = {f.addressee_id if f.requester_id == user_id else f.requester_id for f in friendships}

    if not friend_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no friends",
        )

    return list(friend_ids)


def _calculate_genre_percentages(db: Session, target_user_ids: list[uuid.UUID]) -> list[CommunityGenreHour]:
    genre_totals = get_community_genre_totals(db, target_user_ids)
    if not genre_totals:
        return []

    total_minutes_across_genres = sum(minutes for _, _, minutes in genre_totals)
    if total_minutes_across_genres == 0:
        return []

    result = [
        CommunityGenreHour(
            id=genre_id,
            description=description,
            percentage=round((minutes / total_minutes_across_genres) * 100.0, 2),
        )
        for genre_id, description, minutes in genre_totals
        if minutes > 0
    ]

    result.sort(key=lambda x: x.percentage, reverse=True)
    return result
