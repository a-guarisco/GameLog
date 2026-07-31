import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { setApiProvider } from '@gamelog/api-manager/apiManager';

describe('apiEndsPoints', () => {
  const originalSteamKey = process.env.EXPO_PUBLIC_STEAM_API_KEY;
  const originalBackendBaseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_STEAM_API_KEY = 'abc123';
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL = 'https://api.mydomain.dev';
  });

  afterEach(() => {
    if (originalSteamKey === undefined) {
      delete process.env.EXPO_PUBLIC_STEAM_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_STEAM_API_KEY = originalSteamKey;
    }

    if (originalBackendBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL = originalBackendBaseUrl;
    }

    setApiProvider('steam');
  });

  describe('isBackendProvider', () => {
    it('returns false when steam provider is selected', () => {
      setApiProvider('steam');
      expect(isBackendProvider()).toBe(false);
    });

    it('returns true when backend provider is selected', () => {
      setApiProvider('backend');
      expect(isBackendProvider()).toBe(true);
    });
  });

  describe('Steam endpoints', () => {
    beforeEach(() => {
      setApiProvider('steam');
    });

    it('builds steam endpoints correctly', () => {
      expect(EndPoints.getNewsForApp('440', 2, 300)).toBe(
        'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=440&count=2&maxlength=300'
      );
      expect(EndPoints.getGlobalAchievementsForApp('440')).toBe(
        'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=440'
      );
      expect(EndPoints.getPlayerAchievements('440', '7656119')).toBe(
        'https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=abc123&steamid=7656119'
      );
      expect(EndPoints.getPlayerStats('440', '7656119')).toBe(
        'https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key=abc123&steamid=7656119'
      );
      expect(EndPoints.getPlayersInfo(['1', '2'])).toBe(
        'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=abc123&steamids=1,2'
      );
      expect(EndPoints.getPlayerFriendsList('7656119', false)).toBe(
        'https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=abc123&steamid=7656119&relationship=friend'
      );
      expect(EndPoints.getPlayerFriendsList('7656119', true)).toBe(
        'https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=abc123&steamid=7656119&relationship=all'
      );
      expect(EndPoints.getOwnedGames('7656119', true)).toBe(
        'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=abc123&steamid=7656119&include_appinfo=true&include_played_free_games=true'
      );
      expect(EndPoints.getRecentPlayedGames('7656119', 5)).toBe(
        'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=abc123&steamid=7656119&count=5'
      );
      expect(EndPoints.getGameGenres('440')).toBe(
        'https://store.steampowered.com/api/appdetails?appids=440&filters=genres'
      );
      expect(EndPoints.getSchemaForGame('730')).toBe(
        'https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=abc123&appid=730'
      );
    });
  });

  describe('Backend provider selection', () => {
    it('currently defaults to steam endpoints even with backend provider selected', () => {
      setApiProvider('backend');
      // For now, all endpoints return Steam URLs
      // This test documents the current behavior and serves as a placeholder
      // for future implementation of backend-specific endpoints
      expect(EndPoints.getNewsForApp('440', 2, 300)).toBe(
        'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=440&count=2&maxlength=300'
      );
    });
  });
});
