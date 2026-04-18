import { backendApiClient } from '@gamelog/api-manager/providers/backendProvider';
import { steamApiClient } from '@gamelog/api-manager/providers/steamProvider';
import { ApiClient, ApiProvider } from '@gamelog/api-manager/providers/types';

const API_PROVIDER = (process.env.EXPO_PUBLIC_API_PROVIDER ?? 'steam').toLowerCase();

let currentApiProvider: ApiProvider = API_PROVIDER === 'backend' ? 'backend' : 'steam';

const getApiClient = (): ApiClient =>
  currentApiProvider === 'backend' ? backendApiClient : steamApiClient;

export const setApiProvider = (provider: ApiProvider): void => {
  currentApiProvider = provider;
};

export const getApiProvider = (): ApiProvider => currentApiProvider;

export default {
  getGameNews: (appId: string, count: number, maxLength: number) =>
    getApiClient().getGameNews(appId, count, maxLength),
  getGlobalAchievement: (appId: string) => getApiClient().getGlobalAchievement(appId),
  getAllPlayerAchievementsPerApp: (appId: string, steamId: string) =>
    getApiClient().getAllPlayerAchievementsPerApp(appId, steamId),
  getCompletedPlayerAchievementsAndStatsPerApp: (appId: string, steamId: string) =>
    getApiClient().getCompletedPlayerAchievementsAndStatsPerApp(appId, steamId),
  getPlayersInfo: (steamIds: string[]) => getApiClient().getPlayersInfo(steamIds),
  getPlayerFriendsInfo: (steamId: string, includePending: boolean) =>
    getApiClient().getPlayerFriendsInfo(steamId, includePending),
  getOwnedGames: (steamId: string, includeFreeGame: boolean) =>
    getApiClient().getOwnedGames(steamId, includeFreeGame),
  getRecentPlayedGames: (steamId: string, count: number) =>
    getApiClient().getRecentPlayedGames(steamId, count),
  getGameGenres: (appId: string) => getApiClient().getGameGenres(appId),
};
