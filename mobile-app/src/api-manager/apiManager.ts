import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { getApiProvider, setApiProvider } from '@gamelog/api-manager/apiProvider';

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}. url Called: ${url}`);
  }
  return response.json();
}

export { getApiProvider, setApiProvider, isBackendProvider, fetchData };
export default {
  getGameNews: (appId: string, count: number, maxLength: number) =>
    fetchData(EndPoints.getNewsForApp(appId, count, maxLength)),
  getGlobalAchievement: (appId: string) => fetchData(EndPoints.getGlobalAchievementsForApp(appId)),
  getAllPlayerAchievementsPerApp: (appId: string, steamId: string) =>
    fetchData(EndPoints.getPlayerAchievements(appId, steamId)),
  getCompletedPlayerAchievementsAndStatsPerApp: (appId: string, steamId: string) =>
    fetchData(EndPoints.getPlayerStats(appId, steamId)),
  getPlayersInfo: (steamIds: string[]) => fetchData(EndPoints.getPlayersInfo(steamIds)),
  getPlayerFriendsInfo: (steamId: string, includePending: boolean) =>
    fetchData(EndPoints.getPlayerFriendsList(steamId, includePending)),
  getOwnedGames: (steamId: string, includeFreeGame: boolean) =>
    fetchData(EndPoints.getOwnedGames(steamId, includeFreeGame)),
  getRecentPlayedGames: (steamId: string, count: number) =>
    fetchData(EndPoints.getRecentPlayedGames(steamId, count)),
  getGameGenres: (appId: string) => fetchData(EndPoints.getGameGenres(appId)),
};
