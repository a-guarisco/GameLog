import uuid
from datetime import date, timedelta

from sqlalchemy import bindparam, text
from sqlmodel import Session


def get_community_daily_totals(db: Session, target_user_ids: list[uuid.UUID], start_date: date, end_date: date) -> dict[date, int]:
    if not target_user_ids:
        return {}

    query_start = start_date - timedelta(days=1)

    sql = text("""
        WITH daily_deltas AS (
            SELECT 
                created_at,
                CASE 
                    WHEN COALESCE(last_day_playtime - LAG(last_day_playtime) OVER (PARTITION BY user_id, steam_app_id ORDER BY created_at), 0) > 0 
                    THEN COALESCE(last_day_playtime - LAG(last_day_playtime) OVER (PARTITION BY user_id, steam_app_id ORDER BY created_at), 0)
                    ELSE 0 
                END AS delta_playtime
            FROM steamrollingtime
            WHERE user_id IN :target_ids
              AND created_at >= :query_start
              AND created_at <= :end_date
        )
        SELECT 
            created_at,
            SUM(delta_playtime) as total_playtime
        FROM daily_deltas
        WHERE created_at >= :start_date
        GROUP BY created_at
    """).bindparams(bindparam("target_ids", expanding=True))

    results = db.execute(
        sql, {"target_ids": [uid.hex for uid in target_user_ids], "query_start": query_start, "start_date": start_date, "end_date": end_date}
    ).fetchall()

    parsed_results = {}
    for row in results:
        d = row[0]
        if isinstance(d, str):
            d = date.fromisoformat(d)
        parsed_results[d] = int(row[1] or 0)

    return parsed_results


def get_community_game_totals_and_players(
    db: Session, target_user_ids: list[uuid.UUID], start_date: date, end_date: date
) -> tuple[dict[str, int], dict[str, int]]:
    if not target_user_ids:
        return {}, {}

    query_start = start_date - timedelta(days=1)

    sql = text("""
        WITH daily_deltas AS (
            SELECT 
                user_id,
                steam_app_id,
                created_at,
                CASE 
                    WHEN COALESCE(last_day_playtime - LAG(last_day_playtime) OVER (PARTITION BY user_id, steam_app_id ORDER BY created_at), 0) > 0 
                    THEN COALESCE(last_day_playtime - LAG(last_day_playtime) OVER (PARTITION BY user_id, steam_app_id ORDER BY created_at), 0)
                    ELSE 0 
                END AS delta_playtime
            FROM steamrollingtime
            WHERE user_id IN :target_ids
              AND created_at >= :query_start
              AND created_at <= :end_date
        ),
        user_game_totals AS (
            SELECT
                user_id,
                steam_app_id,
                SUM(delta_playtime) as total_playtime
            FROM daily_deltas
            WHERE created_at >= :start_date
            GROUP BY user_id, steam_app_id
        )
        SELECT 
            steam_app_id,
            SUM(total_playtime) as total_community_playtime,
            COUNT(user_id) as player_count
        FROM user_game_totals
        WHERE total_playtime > 0
        GROUP BY steam_app_id
    """).bindparams(bindparam("target_ids", expanding=True))

    results = db.execute(
        sql, {"target_ids": [uid.hex for uid in target_user_ids], "query_start": query_start, "start_date": start_date, "end_date": end_date}
    ).fetchall()

    totals = {}
    players = {}
    for row in results:
        app_id = row[0]
        totals[app_id] = int(row[1] or 0)
        players[app_id] = int(row[2] or 0)

    return totals, players


def get_community_genre_totals(db: Session, target_user_ids: list[uuid.UUID]) -> list[tuple[str, str, int]]:
    if not target_user_ids:
        return []

    sql = text("""
        WITH ranked_playtimes AS (
            SELECT 
                user_id,
                steam_app_id,
                last_day_playtime,
                ROW_NUMBER() OVER (
                    PARTITION BY user_id, steam_app_id 
                    ORDER BY created_at DESC
                ) AS rn
            FROM steamrollingtime
            WHERE user_id IN :target_ids
        ),
        latest_playtimes AS (
            SELECT 
                steam_app_id,
                last_day_playtime
            FROM ranked_playtimes
            WHERE rn = 1 AND last_day_playtime > 0
        ),
        game_totals AS (
            SELECT 
                steam_app_id,
                SUM(last_day_playtime) AS total_playtime
            FROM latest_playtimes
            GROUP BY steam_app_id
        )
        SELECT 
            g.id AS genre_id,
            g.description AS genre_description,
            SUM(gt.total_playtime) AS genre_playtime
        FROM game_totals gt
        JOIN game gm ON gm.steam_app_id = gt.steam_app_id
        JOIN gamegenrelink ggl ON ggl.game_id = gm.id
        JOIN genre g ON g.id = ggl.genre_id
        GROUP BY g.id, g.description
        ORDER BY genre_playtime DESC
    """).bindparams(bindparam("target_ids", expanding=True))

    results = db.execute(
        sql,
        {
            "target_ids": [uid.hex for uid in target_user_ids],
        },
    ).fetchall()

    return [(str(row[0]), str(row[1]), int(row[2] or 0)) for row in results]
