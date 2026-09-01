

import calendar
from collections import defaultdict
from datetime import date, timedelta
import uuid
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
) -> list[CommunityGenreHour]:
    """
    Returns the percentage share of playtime for each genre for the specified community scope.
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db)

    return _calculate_genre_percentages(db, target_user_ids)


def get_community_weekly_playtime(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
) -> CommunityWeeklyPlaytimeResponse:
    """
    Return the weekly playtime comparison for the specified 7-day period (Monday to Sunday)
    comparing the user vs the community average (excluding the user).
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db)

    week_dates = [start_date + timedelta(days=i) for i in range(7)]

    user_daily_map = _get_user_daily_playtimes_map(db, current_user.id, end_date)
    user_hours = [
        round(user_daily_map.get(d, 0) / 60.0, 2)
        for d in week_dates
    ]

    community_daily_totals = [0] * 7
    for target_id in target_user_ids:
        t_daily_map = _get_user_daily_playtimes_map(db, target_id, end_date)
        for idx, d in enumerate(week_dates):
            community_daily_totals[idx] += t_daily_map.get(d, 0)

    num_target_users = len(target_user_ids)
    community_hours = [
        round(total_mins / (60.0 * num_target_users), 2)
        for total_mins in community_daily_totals
    ]

    return CommunityWeeklyPlaytimeResponse(user=user_hours, community=community_hours)


def get_community_monthly_playtime(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
) -> CommunityMonthlyPlaytimeResponse:
    """
    Return the month-by-month playtime comparison for the specified period
    comparing the user vs the community average (excluding the user).
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db)

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

    target_daily_maps = [
        _get_user_daily_playtimes_map(db, target_id, end_date)
        for target_id in target_user_ids
    ]

    user_hours: list[float] = []
    community_hours: list[float] = []
    num_target_users = len(target_user_ids)

    for y, m in months:
        last_day = calendar.monthrange(y, m)[1]
        days_in_month = [date(y, m, d) for d in range(1, last_day + 1)]

        user_month_mins = sum(user_daily_map.get(d, 0) for d in days_in_month)
        user_hours.append(round(user_month_mins / 60.0, 2))

        community_month_mins = sum(
            t_map.get(d, 0)
            for t_map in target_daily_maps
            for d in days_in_month
        )
        community_hours.append(round(community_month_mins / (60.0 * num_target_users), 2))

    return CommunityMonthlyPlaytimeResponse(user=user_hours, community=community_hours)


def get_community_weekly_top_games(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    reference: TopGameReference = TopGameReference.COMMUNITY,
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
    )


def get_community_monthly_top_games(
    scope: CommunityScope,
    start_date: date,
    end_date: date,
    user: AuthenticatedUser,
    db: Session,
    reference: TopGameReference = TopGameReference.COMMUNITY,
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
    )

def get_community_game_statuses(
    scope: CommunityScope,
    user: AuthenticatedUser,
    db: Session,
) -> CommunityGameStatusResponse:
    """
    Return the game status breakdown (count and percentage) for the user vs the community average.
    """
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db)

    user_shelvings = db.exec(
        select(Shelving).where(Shelving.owner_id == current_user.id)
    ).all()
    user_counts: dict[GameStatus, int] = {s: 0 for s in GameStatus}
    for shelving in user_shelvings:
        user_counts[shelving.status] += 1

    user_num_of_games = len(user_shelvings)
    user_items = [
        CommunityGameStatusItem(
            status=status,
            count=float(user_counts[status]),
            percentage=round((user_counts[status] / user_num_of_games) * 100.0, 2)
            if user_num_of_games > 0
            else 0.0,
        )
        for status in GameStatus
    ]

    community_shelvings = db.exec(
        select(Shelving).where(col(Shelving.owner_id).in_(target_user_ids))
    ).all()
    num_target_users = len(target_user_ids)
    community_counts: dict[GameStatus, int] = {s: 0 for s in GameStatus}
    for shelving in community_shelvings:
        community_counts[shelving.status] += 1

    total_community_games = len(community_shelvings)
    community_num_of_games = (
        round(total_community_games / num_target_users, 2)
        if num_target_users > 0
        else 0.0
    )

    community_items = [
        CommunityGameStatusItem(
            status=status,
            count=round(community_counts[status] / num_target_users, 2)
            if num_target_users > 0
            else 0.0,
            percentage=round((community_counts[status] / total_community_games) * 100.0, 2)
            if total_community_games > 0
            else 0.0,
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
) -> list:
    current_user = user_service.get_user_by_firebase_uid(db, user.uid)
    target_user_ids = _compute_target_ids(scope, current_user, db)

    user_daily_game_map = _get_user_daily_game_playtimes_map(db, current_user.id, end_date)
    user_game_totals = _aggregate_game_playtimes_for_dates(user_daily_game_map, dates)

    community_game_totals: dict[str, int] = defaultdict(int)
    community_game_player_counts: dict[str, int] = defaultdict(int)
    for target_id in target_user_ids:
        t_daily_game_map = _get_user_daily_game_playtimes_map(db, target_id, end_date)
        t_totals = _aggregate_game_playtimes_for_dates(t_daily_game_map, dates)
        for app_id, mins in t_totals.items():
            if mins > 0:
                community_game_totals[app_id] += mins
                community_game_player_counts[app_id] += 1

    all_game_ids = set(user_game_totals.keys()) | set(community_game_totals.keys())

    candidates = []
    for app_id in all_game_ids:
        user_hours = round(user_game_totals.get(app_id, 0) / 60.0, 2)
        player_count = community_game_player_counts.get(app_id, 0)
        comm_hours = (
            round(community_game_totals.get(app_id, 0) / (60.0 * player_count), 2)
            if player_count > 0
            else 0.0
        )
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
        candidates.sort(
            key=lambda x: (-x.user_playtime, -x.community_playtime, x.id)
        )
    else:
        candidates.sort(
            key=lambda x: (-x.community_playtime, x.id)
        )

    return candidates[:5]


def _get_user_daily_playtimes(
    db: Session, user_id: uuid.UUID, end_date: date
) -> list[DayByDayPlaytime]:
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


def _get_user_daily_game_playtimes_map(
    db: Session, user_id: uuid.UUID, end_date: date
) -> dict[date, dict[str, int]]:
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
) -> list[uuid.UUID]:
    match scope:
        case CommunityScope.GLOBAL:
            target_user_ids = _get_global_user_ids(db, current_user.id)
        case CommunityScope.REGION:
            target_user_ids = _get_regional_user_ids(db, current_user)
        case CommunityScope.FRIENDS:
            target_user_ids = _get_friend_user_ids(db, current_user.id)
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
