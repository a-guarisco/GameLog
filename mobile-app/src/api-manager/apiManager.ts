import EndPoints from '@gamelog/api-manager/apiEndsPoints';
import {
  GlobalAchievement,
  PlayerAchievement,
  SteamNews,
  PlayersInfo,
  PlayerFriends,
  PlayerStats,
  OwnedGames,
  RecentPlayedGames,
  GameGenres,
} from '@gamelog/api-manager/dto';

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}. url Called: ${url}`);
  }
  return response.json();
}

const getGameNews = async (appId: string, count: number, maxLength: number): Promise<SteamNews> =>
  fetchData<SteamNews>(EndPoints.GET_NEWS_FOR_APP(appId, count, maxLength));

const getGlobalAchievement = async (appId: string): Promise<GlobalAchievement> =>
  fetchData<GlobalAchievement>(EndPoints.GET_GLOBAL_ACHIEVEMENTS_FOR_APP(appId));

const getAllPlayerAchievementsPerApp = async (
  appId: string,
  steamId: string
): Promise<PlayerAchievement> =>
  fetchData<PlayerAchievement>(EndPoints.GET_PLAYER_ACHIEVEMENTS(appId, steamId));

const getCompletedPlayerAchievementsAndStatsPerApp = async (
  appId: string,
  steamId: string
): Promise<PlayerStats> => fetchData<PlayerStats>(EndPoints.GET_PLAYER_STATS(appId, steamId));

const getPlayersInfo = async (steamIds: string[]): Promise<PlayersInfo> =>
  fetchData<PlayersInfo>(EndPoints.GET_PLAYERS_INFO(steamIds));

const getPlayerFriendsInfo = async (
  steamId: string,
  includePending: boolean
): Promise<PlayerFriends> =>
  fetchData<PlayerFriends>(EndPoints.GET_PLAYER_FRIENDS_LIST(steamId, includePending));

const getOwnedGames = async (steamId: string, includeFreeGame: boolean): Promise<OwnedGames> =>
  fetchData<OwnedGames>(EndPoints.GET_OWNED_GAMES(steamId, includeFreeGame));

const getRecentPlayedGames = async (steamId: string, count: number): Promise<RecentPlayedGames> =>
  fetchData<RecentPlayedGames>(EndPoints.GET_RECENT_PLAYED_GAMES(steamId, count));

const getGameGenres = async (appId: string): Promise<GameGenres> =>
  fetchData<GameGenres>(EndPoints.GET_GAME_GENRES(appId));

export default {
  getGameNews,
  getGlobalAchievement,
  getAllPlayerAchievementsPerApp,
  getCompletedPlayerAchievementsAndStatsPerApp,
  getPlayersInfo,
  getPlayerFriendsInfo,
  getOwnedGames,
  getRecentPlayedGames,
  getGameGenres,
};
