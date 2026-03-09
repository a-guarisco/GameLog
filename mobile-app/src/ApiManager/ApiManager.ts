import EndPoints from './ApiEndPoints';
import {
  GlobalAchievement,
  PlayerAchievement,
  SteamNews,
  PlayersInfo,
  PlayerFriends,
  PlayerStats,
  OwnedGames,
  RecentPlayedGames,
} from './DTO';

class ApiManager {
  private static async fetchData<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  }

  static async getGameNews(appId: number, count: number, maxLength: number): Promise<SteamNews> {
    return this.fetchData<SteamNews>(EndPoints.GET_NEWS_FOR_APP(appId, count, maxLength));
  }

  static async getGlobalAchievement(appId: number): Promise<GlobalAchievement> {
    return this.fetchData<GlobalAchievement>(EndPoints.GET_GLOBAL_ACHIEVEMENTS_FOR_APP(appId));
  }

  static async getAllPlayerAchievementsPerApp(
    appId: number,
    steamId: string
  ): Promise<PlayerAchievement> {
    return this.fetchData<PlayerAchievement>(EndPoints.GET_PLAYER_ACHIEVEMENTS(appId, steamId));
  }

  static async getCompletedPlayerAchievementsAndStatsPerApp(
    appId: number,
    steamId: string
  ): Promise<PlayerStats> {
    return this.fetchData<PlayerStats>(EndPoints.GET_PLAYER_STATS(appId, steamId));
  }

  static async getPlayersInfo(steamIds: string[]): Promise<any> {
    return this.fetchData<PlayersInfo>(EndPoints.GET_PLAYERS_INFO(steamIds));
  }

  static async getPlayerFriendsInfo(
    steamId: string,
    includePending: boolean
  ): Promise<PlayerFriends> {
    return this.fetchData<PlayerFriends>(
      EndPoints.GET_PLAYER_FRIENDS_LIST(steamId, includePending)
    );
  }

  static async getOwnedGames(steamId: string, includeFreeGame: boolean): Promise<OwnedGames> {
    return this.fetchData<OwnedGames>(EndPoints.GET_OWNED_GAMES(steamId, includeFreeGame));
  }

  static async getRecentPlayedGames(steamId: string, count: number): Promise<RecentPlayedGames> {
    return this.fetchData<RecentPlayedGames>(EndPoints.GET_RECENT_PLAYED_GAMES(steamId, count));
  }
}
export default ApiManager;
