import { fetchData } from '@gamelog/api-manager/providers/fetchData';
import { ApiClient } from '@gamelog/api-manager/providers/types';

const getBackendBaseUrl = (): string =>
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? 'http://localhost:8000';

const buildUrl = (path: string): string => `${getBackendBaseUrl()}${path}`;

export const backendApiClient: ApiClient = {
  getGameNews: (appId, count, maxLength) =>
    fetchData(buildUrl(`/steam/news?appId=${appId}&count=${count}&maxLength=${maxLength}`)),

  getGlobalAchievement: (appId) => fetchData(buildUrl(`/steam/apps/${appId}/global-achievements`)),

  getAllPlayerAchievementsPerApp: (appId, steamId) =>
    fetchData(buildUrl(`/steam/apps/${appId}/players/${steamId}/achievements`)),

  getCompletedPlayerAchievementsAndStatsPerApp: (appId, steamId) =>
    fetchData(buildUrl(`/steam/apps/${appId}/players/${steamId}/stats`)),

  getPlayersInfo: (steamIds) =>
    fetchData(buildUrl(`/steam/players?steamIds=${steamIds.join(',')}`)),

  getPlayerFriendsInfo: (steamId, includePending) =>
    fetchData(buildUrl(`/steam/players/${steamId}/friends?includePending=${includePending}`)),

  getOwnedGames: (steamId, includeFreeGame) =>
    fetchData(buildUrl(`/steam/players/${steamId}/games/owned?includeFreeGame=${includeFreeGame}`)),

  getRecentPlayedGames: (steamId, count) =>
    fetchData(buildUrl(`/steam/players/${steamId}/games/recent?count=${count}`)),

  getGameGenres: (appId) => fetchData(buildUrl(`/steam/apps/${appId}/genres`)),
};
