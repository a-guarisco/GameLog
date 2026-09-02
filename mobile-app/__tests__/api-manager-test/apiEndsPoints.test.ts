import EndPoints, { isBackendProvider } from '@gamelog/api-manager/apiEndsPoints';
import { setSteamApiKey } from '@gamelog/api-manager/steamApiKey';
import { setApiProvider } from '@gamelog/api-manager/apiManager';

describe('apiEndsPoints', () => {
  const originalBackendBaseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    setSteamApiKey('abc123', false);
    process.env.EXPO_PUBLIC_BACKEND_BASE_URL = 'https://api.mydomain.dev';
  });

  afterEach(() => {
    setSteamApiKey('', false);
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

    it('builds game and user endpoints correctly', () => {
      expect(EndPoints.getGameBasicInfo('440')).toBe(
        'https://store.steampowered.com/api/appdetails?appids=440&filters=basic'
      );
      expect(EndPoints.getStreakByUser()).toBe('https://api.mydomain.dev/games/streak_by_user');
      expect(EndPoints.getStreakByGame('440')).toBe(
        'https://api.mydomain.dev/games/streak_by_game?steam_app_id=440'
      );
      expect(EndPoints.getGenresBatch()).toBe('https://api.mydomain.dev/games/genres_batch');
      expect(EndPoints.getAuthOutcome()).toBe('https://api.mydomain.dev/me');
      expect(EndPoints.getBackendHealth()).toBe('https://api.mydomain.dev/health');
      expect(EndPoints.registerUser()).toBe('https://api.mydomain.dev/users/register');
      expect(EndPoints.getUserMe()).toBe('https://api.mydomain.dev/users/me');
      expect(EndPoints.registerDeviceToken()).toBe(
        'https://api.mydomain.dev/notifications/register_device'
      );
      expect(EndPoints.unregisterDeviceToken()).toBe(
        'https://api.mydomain.dev/notifications/unregister_device'
      );
    });

    it('builds daily report endpoint with optional parameters', () => {
      expect(EndPoints.getDailyReport()).toBe('https://api.mydomain.dev/games/report');
      expect(EndPoints.getDailyReport('2026-08-01')).toBe(
        'https://api.mydomain.dev/games/report?start_date=2026-08-01'
      );
      expect(EndPoints.getDailyReport(undefined, '2026-08-10')).toBe(
        'https://api.mydomain.dev/games/report?end_date=2026-08-10'
      );
      expect(EndPoints.getDailyReport('2026-08-01', '2026-08-10')).toBe(
        'https://api.mydomain.dev/games/report?start_date=2026-08-01&end_date=2026-08-10'
      );
    });

    it('builds community endpoints correctly', () => {
      expect(EndPoints.getCommunityGenre('global')).toBe(
        'https://api.mydomain.dev/community/genre?scope=global'
      );
      expect(EndPoints.getCommunityWeeklyPlaytime('friends', '2026-08-01', '2026-08-07')).toBe(
        'https://api.mydomain.dev/community/weekly_playtime?scope=friends&start_date=2026-08-01&end_date=2026-08-07'
      );
      expect(EndPoints.getCommunityMonthlyPlaytime('region', '2026-08-01', '2026-08-31')).toBe(
        'https://api.mydomain.dev/community/monthly_playtime?scope=region&start_date=2026-08-01&end_date=2026-08-31'
      );
      expect(
        EndPoints.getCommunityWeeklyTopGames('global', '2026-08-01', '2026-08-07', 'friends')
      ).toBe(
        'https://api.mydomain.dev/community/weekly_top_game_playtime?scope=global&start_date=2026-08-01&end_date=2026-08-07&reference=friends'
      );
      expect(
        EndPoints.getCommunityWeeklyTopGames('global', '2026-08-01', '2026-08-07')
      ).toBe(
        'https://api.mydomain.dev/community/weekly_top_game_playtime?scope=global&start_date=2026-08-01&end_date=2026-08-07&reference=community'
      );
      expect(
        EndPoints.getCommunityMonthlyTopGames('region', '2026-08-01', '2026-08-31', 'community')
      ).toBe(
        'https://api.mydomain.dev/community/monthly_top_game_playtime?scope=region&start_date=2026-08-01&end_date=2026-08-31&reference=community'
      );
    });

    it('falls back to default localhost URL when EXPO_PUBLIC_BACKEND_BASE_URL is not set', () => {
      delete process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
      expect(EndPoints.getBackendHealth()).toBe('http://localhost:8000/health');
    });
  });
});

