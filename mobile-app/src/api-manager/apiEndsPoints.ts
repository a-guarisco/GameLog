import { getApiProvider } from '@gamelog/api-manager/apiProvider';

const STEAM_BASE_URL = 'https://api.steampowered.com/';
const STORE_BASE_URL = 'https://store.steampowered.com';

const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';

const getSteamApiKey = (): string => {
  if (process.env.EXPO_PUBLIC_STEAM_API_KEY) {
    return process.env.EXPO_PUBLIC_STEAM_API_KEY;
  } else {
    console.warn('STEAM API key is not set.');
    return '';
  }
};

const getRelationship = (includePending: boolean): string => (includePending ? 'all' : 'friend');

/**
 * Checks if the current API provider is backend.
 * Use this method to add granular control per endpoint based on the provider.
 *
 * @returns true if backend provider is selected, false if steam provider
 */
const isBackendProvider = (): boolean => getApiProvider() === 'backend';

const EndPoints = {
  getNewsForApp: (appId: string, count: number, maxLength: number) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=${maxLength}`;
  },

  getGlobalAchievementsForApp: (appId: string) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}`;
  },

  getPlayerAchievements: (appId: string, steamId: string) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${getSteamApiKey()}&steamid=${steamId}`;
  },

  getPlayerStats: (appId: string, steamId: string) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${getSteamApiKey()}&steamid=${steamId}`;
  },

  getPlayersInfo: (steamIds: string[]) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamUser/GetPlayerSummaries/v0002/?key=${getSteamApiKey()}&steamids=${steamIds.join(',')}`;
  },

  getPlayerFriendsList: (steamId: string, includePending: boolean) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamUser/GetFriendList/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&relationship=${getRelationship(includePending)}`;
  },

  getOwnedGames: (steamId: string, include_sub: boolean, includeFreeGame: boolean) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}IPlayerService/GetOwnedGames/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&include_appinfo=true&include_free_sub=${include_sub}&include_played_free_games=${includeFreeGame}`;
  },

  getRecentPlayedGames: (steamId: string, count: number) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&count=${count}`;
  },

  getGameGenres: (appId: string) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STORE_BASE_URL}/api/appdetails?appids=${appId}&filters=genres`;
  },

  getSchemaForGame: (appId: string) => {
    // TODO: use isBackendProvider() if backend endpoint differs
    return `${STEAM_BASE_URL}ISteamUserStats/GetSchemaForGame/v2/?key=${getSteamApiKey()}&appid=${appId}`;
  },

  getAuthOutcome: () => {
    return `${BACKEND_BASE_URL}/me`;
  },

  getBackendHealth: () => {
    return `${BACKEND_BASE_URL}/health`;
  },

  registerUser: () => {
    return `${BACKEND_BASE_URL}/users/register`;
  },

  getUserMe: () => {
    return `${BACKEND_BASE_URL}/users/me`;
  },
};

export { isBackendProvider, getSteamApiKey };
export default EndPoints;
