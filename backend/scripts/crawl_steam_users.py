import requests
import json
import time
import os
from rich.progress import Progress

STEAM_API_KEY = "98127524D246054C2D096B9DC054AAC5"
START_IDS = ["76561198077919169", "76561198159652025", "76561198248779666"]
TARGET_COUNT = 200

def get_friends(steam_id):
    url = f"http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&relationship=friend"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if "friendslist" in data and "friends" in data["friendslist"]:
            return [f["steamid"] for f in data["friendslist"]["friends"]]
    except Exception as e:
        print(f"Error fetching friends for {steam_id}: {e}")
    return []

def get_owned_games(steam_id):
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_free_sub=true&include_played_free_games=true"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if "response" in data and "games" in data["response"]:
            return [{"appid": g["appid"], "playtime_forever": g.get("playtime_forever", 0)} for g in data["response"]["games"]]
    except Exception as e:
        print(f"Error fetching owned games for {steam_id}: {e}")
    return []

def get_player_summaries(steam_ids):
    # API allows max 100 steamids per request
    results = []
    for i in range(0, len(steam_ids), 100):
        chunk = steam_ids[i:i+100]
        ids_str = ",".join(chunk)
        url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={STEAM_API_KEY}&steamids={ids_str}"
        try:
            resp = requests.get(url, timeout=5)
            data = resp.json()
            if "response" in data and "players" in data["response"]:
                results.extend(data["response"]["players"])
        except Exception as e:
            print(f"Error fetching summaries: {e}")
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
    crawl()
