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
      expect(EndPoints.getOwnedGames('7656119', true, true)).toBe(
        'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=abc123&steamid=7656119&include_appinfo=true&include_free_sub=true&include_played_free_games=true'
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
      expect(EndPoints.getNumberOfCurrentPlayers('730')).toBe(
        'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=730'
      );
      expect(EndPoints.queryPublishedFiles('413150', '*', 50)).toBe(
        'https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=abc123&query_type=3&appid=413150&filetype=4&cursor=*&numperpage=50&return_short_description=true&return_previews=true'
      );
      // Steam cursors contain characters that have to survive the query string.
      expect(EndPoints.queryPublishedFiles('413150', 'AoIIQolaZ3/H+yOhw=', 20)).toContain(
        'cursor=AoIIQolaZ3%2FH%2ByOhw%3D'
      );
      expect(EndPoints.queryPublishedGuides('413150', '*', 5)).toBe(
        'https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?key=abc123&creator_appid=766&query_type=12&appid=413150&filetype=11&requiredtags[0]=English&match_all_tags=true&cursor=*&numperpage=5&return_short_description=true'
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

    it('builds social backend endpoints correctly', () => {
      expect(EndPoints.searchUsers('alex')).toBe('https://api.mydomain.dev/users/search?q=alex');
      expect(EndPoints.getFriendList()).toBe('https://api.mydomain.dev/users/friend_list');
      expect(EndPoints.addFriend()).toBe('https://api.mydomain.dev/users/add_friend');
      expect(EndPoints.respondToFriend()).toBe('https://api.mydomain.dev/users/respond_to_friend');
      expect(EndPoints.getRecommendations('user-123')).toBe(
        'https://api.mydomain.dev/games/recommendations?friend=user-123&include_top_games=true'
      );
    });

    it('builds the playtime report endpoint with both date bounds', () => {
      expect(EndPoints.getPlaytimeReport('2026-08-05', '2026-08-18')).toBe(
        'https://api.mydomain.dev/games/report?start_date=2026-08-05&end_date=2026-08-18'
      );
    });

    it('builds the day-by-day playtime endpoint with its window', () => {
      expect(EndPoints.getPlaytimeByUser(14)).toBe(
        'https://api.mydomain.dev/games/playtime_by_user?days=14'
      );
    });

    it('passes -1 through as the all-history window', () => {
      expect(EndPoints.getPlaytimeByUser(-1)).toBe(
        'https://api.mydomain.dev/games/playtime_by_user?days=-1'
      );
    });
  });
});
