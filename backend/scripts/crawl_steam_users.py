import requests
import json
import time
import os
import argparse
from rich.progress import Progress

STEAM_API_KEY = "98127524D246054C2D096B9DC054AAC5"
START_IDS = ["76561198077919169", "76561198159652025", "76561198248779666"]
TARGET_COUNT = 200

def _make_request(url, max_retries=3):
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

def get_friends(steam_id):
    url = f"http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&relationship=friend"
    data = _make_request(url)
    if data and "friendslist" in data and "friends" in data["friendslist"]:
        return [f["steamid"] for f in data["friendslist"]["friends"]]
    return []

def get_owned_games(steam_id):
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_free_sub=true&include_played_free_games=true"
    data = _make_request(url)
    if data and "response" in data and "games" in data["response"]:
        return [{"appid": g["appid"], "playtime_forever": g.get("playtime_forever", 0)} for g in data["response"]["games"]]
    return []

def get_player_summaries(steam_ids):
    # API allows max 100 steamids per request
    results = []
    for i in range(0, len(steam_ids), 100):
        chunk = steam_ids[i:i+100]
        ids_str = ",".join(chunk)
        url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={STEAM_API_KEY}&steamids={ids_str}"
        data = _make_request(url)
        if data and "response" in data and "players" in data["response"]:
            results.extend(data["response"]["players"])
    return results

def crawl():
    visited = set()
    queue = START_IDS.copy()
    collected_users = []

    with Progress() as progress:
        task = progress.add_task("[green]Crawling Steam Users...", total=TARGET_COUNT)
        
        # First get profiles for START_IDS
        summaries = get_player_summaries(START_IDS)
        for p in summaries:
            if "loccountrycode" in p:
                owned_games = get_owned_games(p["steamid"])
                collected_users.append({
                    "steam_id": p["steamid"],
                    "personaname": p["personaname"],
                    "region": p["loccountrycode"],
                    "owned_games": owned_games
                })
                progress.update(task, advance=1)
            visited.add(p["steamid"])

        # BFS Crawl
        while queue and len(collected_users) < TARGET_COUNT:
            current_id = queue.pop(0)
            progress.console.print(f"Crawling friends of [bold]{current_id}[/bold]...")
            friends = get_friends(current_id)
            new_friends = [f for f in friends if f not in visited]
            
            if new_friends:
                # Batch fetch summaries for new friends
                summaries = get_player_summaries(new_friends)
                for p in summaries:
                    visited.add(p["steamid"])
                    if "loccountrycode" in p:
                        # Fetch owned games for this friend
                        owned_games = get_owned_games(p["steamid"])
                        
                        collected_users.append({
                            "steam_id": p["steamid"],
                            "personaname": p["personaname"],
                            "region": p["loccountrycode"],
                            "owned_games": owned_games
                        })
                        progress.update(task, advance=1)
                        if len(collected_users) >= TARGET_COUNT:
                            break
                
                queue.extend(new_friends)
            time.sleep(1) # Rate limit respect

    print(f"\n✅ Successfully collected {len(collected_users)} users.")
    
    output_file = os.path.join(os.path.dirname(__file__), "..", "gamelog", "src", "core", "seed_data_users.json")
    with open(output_file, "w") as f:
        json.dump(collected_users[:TARGET_COUNT], f, indent=4)
        
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crawl Steam users for seed data.")
    parser.add_argument("--mock-users", type=int, default=50, help="Number of users to crawl (overrides default TARGET_COUNT).")
    args = parser.parse_args()
    
    if args.mock_users:
        TARGET_COUNT = args.mock_users
        
    crawl()
