import uuid
from collections import defaultdict
from collections.abc import Sequence
from datetime import date, timedelta

import httpx
from fastapi import HTTPException
from sqlmodel import Session, col, select

from src.games import steam_fetcher_service
from src.games.schemas import DailyGameReport, DailyReport, DayByDayPlaytime, SteamGame
from src.models import Game, GameStatus, Genre, Shelving, SteamRollingTime, User
from src.users import user_service


async def update_user_shelving_steamrolling_async(
    session: Session,
    user: User,
    client: httpx.AsyncClient | None = None,
) -> None:
    """
    For the specified user, fetch GetOwnedGames from steam, update DB catalog, User Shelving and create
    a new steamRolling object if the today "playtime_forever" is different than the last one saved (yesterday)
    """
    steam_games = await steam_fetcher_service.get_owned_games_from_steam_async(user, client=client)
    for steam_game in steam_games.games:
        steam_app_id = str(steam_game.appid)

        game_cached = _get_cached_game(session, steam_app_id)
        if not game_cached:
            genres_data = await steam_fetcher_service.get_game_genres_from_steam_async(steam_app_id, client=client)
            genres = [Genre(id=str(g["id"]), description=g["description"]) for g in genres_data]
            game_cached = _cache_game(session, steam_app_id, genres=genres)

        shelve_exists = _get_game_player_shelve(session, game_cached.id, user.id)
        if not shelve_exists:
            game_status = GameStatus.PLAYING if steam_game.playtime_forever > 0 else GameStatus.TO_BE_PLAYED
            _shelve_game(session, game_cached.id, user.id, game_status)
            _create_steam_rolling(session, user, steam_game, steam_app_id)

        latest_rolling = _get_latest_steam_rolling(session, user.id, steam_app_id)
        if latest_rolling is None or steam_game.playtime_forever != latest_rolling.last_day_playtime:
            _create_steam_rolling(session, user, steam_game, steam_app_id)


def get_playtime_by_user(session: Session, user_id: str, days: int = -1) -> list[DayByDayPlaytime]:
    """
    Return a list of DayByDayPlaytime (date, playtime) of length days (if days=-1, return all possible entry)
    telling how much the specified user has played in the last days
    """
    steam_rolling_times = _get_steam_rolling_by_user(session, user_id)
    return _compute_daily_playtimes(steam_rolling_times, days)


def get_playtime_by_game(session: Session, user_id: str, steam_app_id: str, days: int = -1) -> list[DayByDayPlaytime]:
    """
    Return a list of DayByDayPlaytime (date, playtime) of length days (if days=-1, return all possible entry)
    telling how much the specified user has played the specified game (by steam_app_id) in the last days
    """
    steam_rolling_times = _get_steam_rolling_by_user(session, user_id, steam_app_id)
    return _compute_daily_playtimes(steam_rolling_times, days)


def get_streak(session: Session, user_id: str, steam_app_id: str | None, target_date: date | None = None) -> int:
    """
    Return the streak of consecutive days the specified user has played the specified game (by steam_app_id)
    """
    steam_rolling_times = _get_steam_rolling_by_user(session, user_id, steam_app_id)
    if target_date is not None:
        steam_rolling_times = [r for r in steam_rolling_times if r.created_at <= target_date]

    daily_playtimes = _compute_daily_playtimes(steam_rolling_times, days=-1, end_date=target_date)

    if not daily_playtimes:
        return 0

    start_idx = len(daily_playtimes) - 1
    if daily_playtimes[start_idx].playtime_minutes == 0:
        start_idx -= 1

    streak = 0
    for i in range(start_idx, -1, -1):
        if daily_playtimes[i].playtime_minutes > 0:
            streak += 1
        else:
            break

    return streak


def get_daily_report(session: Session, user_id: str, start_date: date | None = None, end_date: date | None = None) -> DailyReport:
    """
    Generate an on-demand daily report for the user between start_date and end_date (defaults to today).
    Scans SteamRollingTime entries and returns a DailyReport containing DailyGameReport for games played between start_date and end_date.
    """
    if start_date is None:
        start_date = date.today()
    if end_date is None:
        end_date = date.today()

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be on or before end date.")

    all_rolling = _get_steam_rolling_by_user(session, user_id)
    rolling_up_to_target = [r for r in all_rolling if r.created_at <= end_date]

    records_by_game = defaultdict(list)
    for record in rolling_up_to_target:
        records_by_game[record.steam_app_id].append(record)

    game_reports: list[DailyGameReport] = []

    for steam_app_id, records in records_by_game.items():
        daily_playtimes = _compute_daily_playtimes(records, days=-1, end_date=end_date)
        range_play_time = sum(dp.playtime_minutes for dp in daily_playtimes if start_date <= dp.date <= end_date)

        if range_play_time > 0:
            streak = get_streak(session, user_id, steam_app_id, target_date=end_date)
            range_daily_playtimes = [dp.playtime_minutes for dp in daily_playtimes if start_date <= dp.date <= end_date and dp.playtime_minutes > 0]
            game_reports.append(
                DailyGameReport(
                    app_id=steam_app_id,
                    today_play_time=range_play_time,
                    streak=streak,
                    days_played_count=len(range_daily_playtimes),
                    max_playtime_per_day=max(range_daily_playtimes) if range_daily_playtimes else 0,
                )
            )

    return DailyReport(date=end_date, game_reports=game_reports)


def update_game_status(session: Session, user_id: str, steam_app_id: str, status: GameStatus | str):
    """
    Update the status of a game for a user. If the game is not already in the user's shelving, an error will be raised.
    """
    if isinstance(status, str):
        cleaned = status.strip().lower()
        try:
            status = GameStatus(cleaned)
        except ValueError:
            try:
                status = GameStatus[status.strip().upper()]
            except KeyError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid game status: '{status}'. Valid statuses are: {[s.value for s in GameStatus]}",
                )

    user = user_service.get_user_by_firebase_uid(session, user_id)
    game = _get_cached_game(session, steam_app_id)

    if not game:
        raise HTTPException(status_code=404, detail="Game not found in cache.")

    shelving = _get_game_player_shelve(session, game.id, user.id)

    if not shelving:
        raise HTTPException(status_code=404, detail="Game not found in user's shelving.")

    shelving.status = status
    session.add(shelving)
    session.commit()





def _get_cached_game(session: Session, steam_app_id: str) -> Game | None:
    return session.exec(select(Game).where(Game.steam_app_id == steam_app_id)).first()


def _get_game_player_shelve(session: Session, game_id: uuid.UUID, user_id: uuid.UUID) -> Shelving | None:
    return session.exec(select(Shelving).where(Shelving.game_id == game_id).where(Shelving.owner_id == user_id)).first()


def _cache_game(session: Session, steam_app_id: str, genres: list[Genre] | None = None) -> Game:
    game_cached = Game(
        steam_app_id=steam_app_id,
    )
    if genres:
        resolved_genres = []
        for g in genres:
            existing = session.get(Genre, g.id)
            if not existing:
                session.add(g)
                resolved_genres.append(g)
            else:
                resolved_genres.append(existing)
        game_cached.genres = resolved_genres
    session.add(game_cached)
    session.commit()
    return game_cached


def _shelve_game(session: Session, game_id: uuid.UUID, user_id: uuid.UUID, status: GameStatus) -> None:
    shelving = Shelving(
        game_id=game_id,
        owner_id=user_id,
        status=status,
    )
    session.add(shelving)
    session.commit()


def _create_steam_rolling(session: Session, user: User, game: SteamGame, steam_app_id: str) -> None:
    steam_rolling = SteamRollingTime(
        user_id=user.id,
        steam_app_id=steam_app_id,
        last_day_playtime=game.playtime_forever,
        created_at=date.today(),
    )
    session.add(steam_rolling)
    session.commit()


def _get_latest_steam_rolling(session: Session, user_id: uuid.UUID, steam_app_id: str) -> SteamRollingTime | None:
    return session.exec(
        select(SteamRollingTime)
        .where(SteamRollingTime.user_id == user_id)
        .where(SteamRollingTime.steam_app_id == steam_app_id)
        .order_by(col(SteamRollingTime.created_at).desc())
    ).first()


def compute_daily_playtimes(
    steam_rolling_times: Sequence[SteamRollingTime],
    days: int,
    end_date: date | None = None,
) -> list[DayByDayPlaytime]:
    records_by_game = defaultdict(list)
    for record in steam_rolling_times:
        records_by_game[record.steam_app_id].append(record)

    daily_totals = defaultdict(int)
    daily_games = defaultdict(lambda: defaultdict(int))
    earliest_date = None

    for app_id, records in records_by_game.items():
        records.sort(key=lambda r: r.created_at)

        for i, record in enumerate(records):
            if earliest_date is None or record.created_at < earliest_date:
                earliest_date = record.created_at

            if i == 0:
                continue

            prev_record = records[i - 1]
            delta_playtime = max(0, record.last_day_playtime - prev_record.last_day_playtime)

            if delta_playtime == 0:
                continue

            delta_days = (record.created_at - prev_record.created_at).days
            if delta_days <= 0:
                delta_days = 1

            # Sanity check: a single game cannot be played more than 24 hours in a day.
            # This handles massive jumps from mock data mismatches or Steam syncing years of offline play.
            max_possible_playtime = delta_days * 1440
            if delta_playtime > max_possible_playtime:
                delta_playtime = max_possible_playtime

            daily_avg = delta_playtime // delta_days
            remainder = delta_playtime % delta_days

            for d in range(1, delta_days + 1):
                target_date = prev_record.created_at + timedelta(days=d)
                assigned_time = daily_avg + (1 if d <= remainder else 0)
                daily_totals[target_date] += assigned_time
                daily_games[target_date][app_id] += assigned_time

    if end_date is None:
        end_date = date.today()

    if earliest_date is None:
        # No records at all for the specified user. If days is -1 return a single day (end_date),
        # otherwise return the requested number of days
        if days == -1:
            return [DayByDayPlaytime(date=end_date, playtime_minutes=0)]
        num_days = days
        start_date = end_date - timedelta(days=num_days - 1)
    elif days == -1:
        # Return everything from earliest record to end_date
        start_date = earliest_date
        num_days = max(0, (end_date - start_date).days + 1)
    else:
        # Return the last N days up to end_date
        candidate_start = end_date - timedelta(days=days - 1)
        if candidate_start > earliest_date:
            start_date = candidate_start
        else:
            start_date = earliest_date
        num_days = max(0, (end_date - start_date).days + 1)

    result = []
    for i in range(num_days):
        target_d = start_date + timedelta(days=i)
        
        games_playtime = []
        if target_d in daily_games:
            from src.games.schemas import GamePlaytime
            for g_app_id, mins in daily_games[target_d].items():
                if mins > 0:
                    games_playtime.append(GamePlaytime(app_id=g_app_id, playtime_minutes=mins))
                    
        result.append(DayByDayPlaytime(
            date=target_d, 
            playtime_minutes=daily_totals.get(target_d, 0),
            games=games_playtime
        ))

    return result


_compute_daily_playtimes = compute_daily_playtimes


def _get_steam_rolling_by_user(session: Session, user_id: str, steam_app_id: str | None = None) -> Sequence[SteamRollingTime]:
    user = user_service.get_user_by_firebase_uid(session, user_id)

    query = select(SteamRollingTime).where(SteamRollingTime.user_id == user.id)
    if steam_app_id is not None:
        query = query.where(SteamRollingTime.steam_app_id == steam_app_id)

    return session.exec(query.order_by(col(SteamRollingTime.created_at))).all()


def get_genres_for_apps(session: Session, app_ids: list[str]) -> dict[str, list[str]]:
    """
    Returns a mapping of steam_app_id to a list of genre descriptions for the requested app_ids.
    It checks both Game and TopGame tables.
    """
    from src.models import Game, TopGame
    from sqlalchemy.orm import selectinload
    from sqlmodel import col
    
    result = {}
    
    if not app_ids:
        return result

    # Check Game table
    query_games = (
        select(Game)
        .where(col(Game.steam_app_id).in_(app_ids))
        .options(selectinload(Game.genres))
    )
    games = session.exec(query_games).all()
    for game in games:
        result[game.steam_app_id] = [g.description for g in game.genres]
        
    # Check TopGame table for the remaining ones
    missing_app_ids = [app_id for app_id in app_ids if app_id not in result]
    if missing_app_ids:
        query_top = (
            select(TopGame)
            .where(col(TopGame.steam_app_id).in_(missing_app_ids))
            .options(selectinload(TopGame.genres))
        )
        top_games = session.exec(query_top).all()
        for tg in top_games:
            result[tg.steam_app_id] = [g.description for g in tg.genres]
            
    return result
