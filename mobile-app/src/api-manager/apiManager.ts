import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { getApiProvider, setApiProvider } from '@gamelog/api-manager/apiProvider';
import { GlobalAchievement, GameSchema } from '@gamelog/api-manager/dto';
import { mergeGlobalAchievementsWithSchema } from '@gamelog/api-manager/achievementMerger';

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
  getSchemaForGame: (appId: string) => fetchData<GameSchema>(EndPoints.getSchemaForGame(appId)),
  getGlobalAchievement: async (appId: string): Promise<GlobalAchievement> => {
    const globalAchievementsPromise = fetchData<GlobalAchievement>(
      EndPoints.getGlobalAchievementsForApp(appId)
    );
    const schemaPromise = fetchData<GameSchema>(EndPoints.getSchemaForGame(appId)).catch(
      () => null
    );

    const [globalData, schemaData] = await Promise.all([
      globalAchievementsPromise,
      schemaPromise,
    ]);

    return mergeGlobalAchievementsWithSchema(globalData, schemaData);
  },
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

