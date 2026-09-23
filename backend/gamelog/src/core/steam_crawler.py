"""Steam Crawler module for GameLog.

Crawls real user profiles, friends graphs, and owned game libraries from Steam Web API
to generate seed_data_users.json.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

import requests
from rich.progress import Progress

START_IDS = ["76561198077919169", "76561198159652025", "76561198248779666"]
FALLBACK_REGIONS = ["IT", "US", "DE", "FR", "GB", "ES", "JP", "CA", "BR", "KR"]
POPULAR_APP_IDS = [730, 570, 1091500, 271590, 1245620, 252490, 1172470, 322330, 431960]


def _make_request(url: str, max_retries: int = 3) -> dict[str, Any] | None:
    for attempt in range(max_retries):
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 429:
                wait_time = 0.5 * (attempt + 1)
                print(f"[429 Too Many Requests] Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Request failed after {max_retries} attempts: {e}")
            else:
                time.sleep(2)
    return None


def get_friends(steam_id: str, api_key: str) -> list[str]:
    url = f"http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={api_key}&steamid={steam_id}&relationship=friend"
    data = _make_request(url)
    if data and "friendslist" in data and "friends" in data["friendslist"]:
        return [f["steamid"] for f in data["friendslist"]["friends"]]
    return []


def get_owned_games(steam_id: str, api_key: str) -> list[dict[str, Any]]:
    url = (
        f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={api_key}"
        f"&steamid={steam_id}&format=json&include_free_sub=true&include_played_free_games=true"
    )
    data = _make_request(url)
    if data and "response" in data and "games" in data["response"]:
        return [{"appid": g["appid"], "playtime_forever": g.get("playtime_forever", 0)} for g in data["response"]["games"]]
    return []


def get_player_summaries(steam_ids: list[str], api_key: str) -> list[dict[str, Any]]:
    results = []
    for i in range(0, len(steam_ids), 100):
        chunk = steam_ids[i : i + 100]
        ids_str = ",".join(chunk)
        url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={api_key}&steamids={ids_str}"
        data = _make_request(url)
        if data and "response" in data and "players" in data["response"]:
            results.extend(data["response"]["players"])
    return results


def crawl_steam_users(
    api_key: str | None = None,
    target_count: int = 50,
    output_path: Path | str | None = None,
) -> list[dict[str, Any]]:
    """Crawls Steam users starting from seed accounts using BFS, saving output to JSON."""
    key = api_key or os.getenv("DEFAULT_STEAM_API_KEY") or os.getenv("STEAM_API_KEY") or os.getenv("SLAITROC_STEAM_API_KEY")
    if not key:
        print("⚠️ No Steam Web API key available. Crawler cannot proceed without an API key.")
        return []

    visited: set[str] = set()
    queue = START_IDS.copy()
    collected_users: list[dict[str, Any]] = []

    try:
        with Progress() as progress:
            task = progress.add_task("[green]Crawling Steam Users...", total=target_count)

            summaries = get_player_summaries(START_IDS, key)
            for p in summaries:
                if "loccountrycode" in p:
                    owned_games = get_owned_games(p["steamid"], key)
                    collected_users.append(
                        {
                            "steam_id": p["steamid"],
                            "personaname": p["personaname"],
                            "region": p["loccountrycode"],
                            "owned_games": owned_games,
                        }
                    )
                    progress.update(task, advance=1)
                visited.add(p["steamid"])

            while queue and len(collected_users) < target_count:
                current_id = queue.pop(0)
                progress.console.print(f"Crawling friends of [bold]{current_id}[/bold]...")
                friends = get_friends(current_id, key)
                new_friends = [f for f in friends if f not in visited]

                if new_friends:
                    summaries = get_player_summaries(new_friends, key)
                    for p in summaries:
                        visited.add(p["steamid"])
                        if "loccountrycode" in p:
                            owned_games = get_owned_games(p["steamid"], key)
                            collected_users.append(
                                {
                                    "steam_id": p["steamid"],
                                    "personaname": p["personaname"],
                                    "region": p["loccountrycode"],
                                    "owned_games": owned_games,
                                }
                            )
                            progress.update(task, advance=1)
                            if len(collected_users) >= target_count:
                                break

                    queue.extend(new_friends)
                time.sleep(1)
    except Exception as e:
        print(f"⚠️ Exception during Steam crawl: {e}")

    final_users = collected_users[:target_count]

    if output_path:
        out_p = Path(output_path)
        try:
            out_p.parent.mkdir(parents=True, exist_ok=True)
            with open(out_p, "w", encoding="utf-8") as f:
                json.dump(final_users, f, indent=4)
            print(f"\n✅ Successfully saved {len(final_users)} users to {out_p}")
        except OSError as e:
            import tempfile

            fallback_p = Path(tempfile.gettempdir()) / "gamelog_seed_data_users.json"
            try:
                with open(fallback_p, "w", encoding="utf-8") as f:
                    json.dump(final_users, f, indent=4)
                print(f"\n✅ Cache salvata nel percorso temporaneo di sistema: {fallback_p}")
            except OSError:
                print(f"\nℹ️ Impossibile salvare su disco ({e}). I dati verranno utilizzati direttamente in memoria.")

    return final_users
