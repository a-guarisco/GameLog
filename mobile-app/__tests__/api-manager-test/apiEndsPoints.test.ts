import EndPoints from '@gamelog/api-manager/apiEndsPoints';
import { setSteamApiKey } from '@gamelog/api-manager/steamApiKey';

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

  });

  describe('Steam endpoints', () => {
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

  describe('Backend endpoints', () => {
    it('builds social backend endpoints correctly', () => {
      expect(EndPoints.searchUsers('alex')).toBe('/users/search?q=alex');
      expect(EndPoints.getFriendList()).toBe('/users/friend_list');
      expect(EndPoints.addFriend()).toBe('/users/add_friend');
      expect(EndPoints.manageFriendship()).toBe('/users/manage_friendship');
      expect(EndPoints.getRecommendations('user-123')).toBe(
        '/games/recommendations?friend=user-123&include_top_games=true'
      );
    });

    it('builds game and user endpoints correctly', () => {
      expect(EndPoints.getGameBasicInfo('440')).toBe(
        'https://store.steampowered.com/api/appdetails?appids=440&filters=basic'
      );
      expect(EndPoints.getStreakByUser()).toBe('/games/streak_by_user');
      expect(EndPoints.getStreakByGame('440')).toBe(
        '/games/streak_by_game?steam_app_id=440'
      );
      expect(EndPoints.getGenresBatch()).toBe('/games/genres_batch');
      expect(EndPoints.getAuthOutcome()).toBe('/me');
      expect(EndPoints.getBackendHealth()).toBe('/health');
      expect(EndPoints.registerUser()).toBe('/users/register');
      expect(EndPoints.getUserMe()).toBe('/users/me');
      expect(EndPoints.registerDeviceToken()).toBe(
        '/notifications/register_device'
      );
      expect(EndPoints.unregisterDeviceToken()).toBe(
        '/notifications/unregister_device'
      );
    });

    it('builds daily report endpoint with optional parameters', () => {
      expect(EndPoints.getDailyReport()).toBe('/games/report');
      expect(EndPoints.getDailyReport('2026-08-01')).toBe(
        '/games/report?start_date=2026-08-01'
      );
      expect(EndPoints.getDailyReport(undefined, '2026-08-10')).toBe(
        '/games/report?end_date=2026-08-10'
      );
      expect(EndPoints.getDailyReport('2026-08-01', '2026-08-10')).toBe(
        '/games/report?start_date=2026-08-01&end_date=2026-08-10'
      );
    });

    it('builds community endpoints correctly', () => {
      expect(EndPoints.getCommunityGenre('global')).toBe(
        '/community/genre?scope=global'
      );
      expect(EndPoints.getCommunityWeeklyPlaytime('friends', '2026-08-01', '2026-08-07')).toBe(
        '/community/weekly_playtime?scope=friends&start_date=2026-08-01&end_date=2026-08-07'
      );
      expect(EndPoints.getCommunityMonthlyPlaytime('region', '2026-08-01', '2026-08-31')).toBe(
        '/community/monthly_playtime?scope=region&start_date=2026-08-01&end_date=2026-08-31'
      );
      expect(
        EndPoints.getCommunityWeeklyTopGames('global', '2026-08-01', '2026-08-07', 'friends')
      ).toBe(
        '/community/weekly_top_game_playtime?scope=global&start_date=2026-08-01&end_date=2026-08-07&reference=friends'
      );
      expect(EndPoints.getCommunityWeeklyTopGames('global', '2026-08-01', '2026-08-07')).toBe(
        '/community/weekly_top_game_playtime?scope=global&start_date=2026-08-01&end_date=2026-08-07&reference=community'
      );
      expect(
        EndPoints.getCommunityMonthlyTopGames('region', '2026-08-01', '2026-08-31', 'community')
      ).toBe(
        '/community/monthly_top_game_playtime?scope=region&start_date=2026-08-01&end_date=2026-08-31&reference=community'
      );
    });

    it('builds the game_status endpoint with and without steam_app_id', () => {
      expect(EndPoints.getGameStatus('730')).toBe(
        '/games/game_status?steam_app_id=730'
      );
      expect(EndPoints.getGameStatus()).toBe('/games/game_status');
    });

    it('builds the update_game_status endpoint', () => {
      expect(EndPoints.updateGameStatus()).toBe('/games/update_game_status');
    });
  });
});
