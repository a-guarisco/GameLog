import uuid
from collections import defaultdict
from datetime import date, timedelta
from sqlmodel import Session
from sqlalchemy import text, bindparam

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
    
    results = db.execute(sql, {
        "target_ids": [uid.hex for uid in target_user_ids],
        "query_start": query_start,
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()
    
    parsed_results = {}
    for row in results:
        d = row[0]
        if isinstance(d, str):
            from datetime import datetime
            d = datetime.strptime(d, "%Y-%m-%d").date()
        parsed_results[d] = int(row[1] or 0)
        
    return parsed_results

def get_community_game_totals_and_players(db: Session, target_user_ids: list[uuid.UUID], start_date: date, end_date: date) -> tuple[dict[str, int], dict[str, int]]:
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
    
    results = db.execute(sql, {
        "target_ids": [uid.hex for uid in target_user_ids],
        "query_start": query_start,
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()
    
    totals = {}
    players = {}
    for row in results:
        app_id = row[0]
        totals[app_id] = int(row[1] or 0)
        players[app_id] = int(row[2] or 0)
        
    return totals, players
