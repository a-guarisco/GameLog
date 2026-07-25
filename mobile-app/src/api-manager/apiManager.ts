import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { getApiProvider, setApiProvider } from '@gamelog/api-manager/apiProvider';
import { mergeGlobalAchievementsWithSchema } from '@gamelog/api-manager/achievementMerger';
import type {
  GameGenres,
  GlobalAchievement,
  GameSchema,
  OwnedGames,
  PlayerAchievement,
  PlayerFriends,
  PlayersInfo,
  PlayerStats,
  RecentPlayedGames,
  SteamNews,
} from '@gamelog/api-manager/dto';

async function fetchData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = init ? await fetch(url, init) : await fetch(url);
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

    const [globalData, schemaData] = await Promise.all([globalAchievementsPromise, schemaPromise]);

    return mergeGlobalAchievementsWithSchema(globalData, schemaData);
  },
  getAllPlayerAchievementsPerApp: (appId: string, steamId: string) =>
    fetchData<PlayerAchievement>(EndPoints.getPlayerAchievements(appId, steamId)),

  getCompletedPlayerAchievementsAndStatsPerApp: (appId: string, steamId: string) =>
    fetchData<PlayerStats>(EndPoints.getPlayerStats(appId, steamId)),

  getPlayersInfo: (steamIds: string[]) =>
    fetchData<PlayersInfo>(EndPoints.getPlayersInfo(steamIds)),

  getPlayerFriendsInfo: (steamId: string, includePending: boolean) =>
    fetchData<PlayerFriends>(EndPoints.getPlayerFriendsList(steamId, includePending)),

  getOwnedGames: (steamId: string, includeStub: boolean, includeFreeGame: boolean) =>
    fetchData<OwnedGames>(EndPoints.getOwnedGames(steamId, includeStub, includeFreeGame)),
  getRecentPlayedGames: (steamId: string, count: number) =>
    fetchData<RecentPlayedGames>(EndPoints.getRecentPlayedGames(steamId, count)),

  getGameGenres: (appId: string) => fetchData<GameGenres>(EndPoints.getGameGenres(appId)),
};
