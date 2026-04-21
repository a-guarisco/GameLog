import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { getApiProvider, setApiProvider } from '@gamelog/api-manager/apiProvider';
import type {
  GameGenres,
  GlobalAchievement,
  OwnedGames,
  PlayerAchievement,
  PlayerFriends,
  PlayersInfo,
  PlayerStats,
  RecentPlayedGames,
  SteamNews,
} from '@gamelog/api-manager/dto';

async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}. url Called: ${url}`);
  }
  return response.json();
}

export { getApiProvider, setApiProvider, isBackendProvider, fetchData };
export default {
  getGameNews: (appId: string, count: number, maxLength: number) =>
    fetchData<SteamNews>(EndPoints.getNewsForApp(appId, count, maxLength)),

  getGlobalAchievement: (appId: string) =>
    fetchData<GlobalAchievement>(EndPoints.getGlobalAchievementsForApp(appId)),

  getAllPlayerAchievementsPerApp: (appId: string, steamId: string) =>
    fetchData<PlayerAchievement>(EndPoints.getPlayerAchievements(appId, steamId)),

  getCompletedPlayerAchievementsAndStatsPerApp: (appId: string, steamId: string) =>
    fetchData<PlayerStats>(EndPoints.getPlayerStats(appId, steamId)),

  getPlayersInfo: (steamIds: string[]) =>
    fetchData<PlayersInfo>(EndPoints.getPlayersInfo(steamIds)),

  getPlayerFriendsInfo: (steamId: string, includePending: boolean) =>
    fetchData<PlayerFriends>(EndPoints.getPlayerFriendsList(steamId, includePending)),

  getOwnedGames: (steamId: string, includeFreeGame: boolean) =>
    fetchData<OwnedGames>(EndPoints.getOwnedGames(steamId, includeFreeGame)),

  getRecentPlayedGames: (steamId: string, count: number) =>
    fetchData<RecentPlayedGames>(EndPoints.getRecentPlayedGames(steamId, count)),

  getGameGenres: (appId: string) => fetchData<GameGenres>(EndPoints.getGameGenres(appId)),
};
