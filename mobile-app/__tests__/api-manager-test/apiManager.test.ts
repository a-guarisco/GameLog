import ApiManager, { setApiProvider, fetchData } from '@gamelog/api-manager/apiManager';
import EndPoints, { getSteamApiKey } from '@gamelog/api-manager/apiEndsPoints';
import { mergeGlobalAchievementsWithSchema } from '@gamelog/api-manager/achievementMerger';
import { auth } from '@gamelog/auth/firebaseClient';

const mockFetch = jest.fn();
window.fetch = mockFetch;

const appId = '440';
const steamId = '76561198077919169';

const testHelper = (
  testNameSuccess: string,
  testNameFail: string,
  mockResponse: any,
  apiFunction: () => Promise<any>,
  expectedUrl: string
) => {
  it(testNameSuccess, async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiFunction();

    expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }));
    expect(result).toEqual(mockResponse);
  });

  it(testNameFail, async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(apiFunction()).rejects.toThrow(`HTTP error: 404. url Called: ${expectedUrl}`);
  });
};

describe('ApiManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setApiProvider('steam');
  });

  testHelper(
    'fetches game news successfully',
    'handles game news fetch failure',
    { newsitems: [{ title: 'News 1' }] },
    () => ApiManager.getGameNews(appId, 2, 300),
    EndPoints.getNewsForApp(appId, 2, 300)
  );

  testHelper(
    'fetches schema for game successfully',
    'handles schema for game fetch failure',
    { game: { gameName: 'CSGO', gameVersion: '1', availableGameStats: { achievements: [] } } },
    () => ApiManager.getSchemaForGame(appId),
    EndPoints.getSchemaForGame(appId)
  );

  testHelper(
    'fetches number of current players successfully',
    'handles number of current players fetch failure',
    { response: { player_count: 652862, result: 1 } },
    () => ApiManager.getNumberOfCurrentPlayers(appId),
    EndPoints.getNumberOfCurrentPlayers(appId)
  );

  describe('getGlobalAchievement', () => {
    it('fetches global achievements and merges schema display name and description', async () => {
      const mockGlobalData = {
        achievementpercentages: {
          achievements: [
            { name: 'PLAY_CS2', percent: 85.5 },
            { name: 'WIN_MATCH', percent: 12.3 },
          ],
        },
      };
      const mockSchemaData = {
        game: {
          gameName: 'CS2',
          gameVersion: '1',
          availableGameStats: {
            achievements: [
              {
                name: 'PLAY_CS2',
                displayName: 'A New Beginning',
                description: 'Played first CS2 match',
              },
              { name: 'WIN_MATCH', displayName: 'Winner Winner', description: 'Won a match' },
            ],
          },
        },
      };

      mockFetch.mockImplementation((url: string) => {
        if (url === EndPoints.getGlobalAchievementsForApp(appId)) {
          return Promise.resolve({ ok: true, json: async () => mockGlobalData });
        }
        if (url === EndPoints.getSchemaForGame(appId)) {
          return Promise.resolve({ ok: true, json: async () => mockSchemaData });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await ApiManager.getGlobalAchievement(appId);

      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getGlobalAchievementsForApp(appId), expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }));
      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getSchemaForGame(appId), expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }));
      expect(result).toEqual({
        achievementpercentages: {
          achievements: [
            {
              name: 'PLAY_CS2',
              percent: 85.5,
              displayName: 'A New Beginning',
              description: 'Played first CS2 match',
            },
            {
              name: 'WIN_MATCH',
              percent: 12.3,
              displayName: 'Winner Winner',
              description: 'Won a match',
            },
          ],
        },
      });
    });

    it('falls back to raw global achievements if game schema fetch fails', async () => {
      const mockGlobalData = {
        achievementpercentages: {
          achievements: [{ name: 'PLAY_CS2', percent: 85.5 }],
        },
      };

      mockFetch.mockImplementation((url: string) => {
        if (url === EndPoints.getGlobalAchievementsForApp(appId)) {
          return Promise.resolve({ ok: true, json: async () => mockGlobalData });
        }
        if (url === EndPoints.getSchemaForGame(appId)) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await ApiManager.getGlobalAchievement(appId);

      expect(result).toEqual(mockGlobalData);
    });

    it('rejects if global achievements fetch fails', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === EndPoints.getGlobalAchievementsForApp(appId)) {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await expect(ApiManager.getGlobalAchievement(appId)).rejects.toThrow();
    });
  });

  describe('mergeGlobalAchievementsWithSchema', () => {
    it('returns original global achievements if schema is null or missing achievements', () => {
      const globalData = {
        achievementpercentages: { achievements: [{ name: 'ach1', percent: 50 }] },
      };
      expect(mergeGlobalAchievementsWithSchema(globalData, null)).toEqual(globalData);
      expect(
        mergeGlobalAchievementsWithSchema(globalData, {
          game: { gameName: 'g', gameVersion: '1' },
        })
      ).toEqual(globalData);
    });
  });

  testHelper(
    'fetches player achievements successfully',
    'handles player achievements fetch failure',
    { playerstats: { achievements: [] } },
    () => ApiManager.getAllPlayerAchievementsPerApp(appId, steamId),
    EndPoints.getPlayerAchievements(appId, steamId)
  );

  testHelper(
    'fetches player stats successfully',
    'handles player stats fetch failure',
    { playerstats: { stats: [] } },
    () => ApiManager.getCompletedPlayerAchievementsAndStatsPerApp(appId, steamId),
    EndPoints.getPlayerStats(appId, steamId)
  );

  testHelper(
    'fetches players info successfully',
    'handles players info fetch failure',
    { response: [] },
    () => ApiManager.getPlayersInfo([steamId]),
    EndPoints.getPlayersInfo([steamId])
  );

  testHelper(
    'fetches player actual friends info successfully',
    'handles player friends info fetch failure',
    { friendslist: { friends: [] } },
    () => ApiManager.getPlayerFriendsInfo(steamId, false),
    EndPoints.getPlayerFriendsList(steamId, false)
  );

  testHelper(
    'fetches owned premium games successfully',
    'handles owned games fetch failure',
    { response: { games: [] } },
    () => ApiManager.getOwnedGames(steamId, false, false),
    EndPoints.getOwnedGames(steamId, false, false)
  );

  testHelper(
    'fetches recent played games successfully',
    'handles recent played games fetch failure',
    { response: { games: [] } },
    () => ApiManager.getRecentPlayedGames(steamId, 5),
    EndPoints.getRecentPlayedGames(steamId, 5)
  );

  testHelper(
    'fetches game genres successfully',
    'handles game genres fetch failure',
    { ['440']: { data: { genres: [] } } },
    () => ApiManager.getGameGenres(appId),
    EndPoints.getGameGenres(appId)
  );

  testHelper(
    'fetches games basic info successfully',
    'handles games basic info fetch failure',
    { ['440']: { success: true, data: { name: 'Team Fortress 2', steam_appid: 440 } } },
    () => ApiManager.getGameBasicInfo(appId),
    EndPoints.getGameBasicInfo(appId)
  );

  describe('authenticated backend streak endpoints', () => {
    beforeEach(() => {
      (auth as any).currentUser = {
        getIdToken: jest.fn().mockResolvedValue('firebase-id-token'),
      };
    });

    afterEach(() => {
      (auth as any).currentUser = null;
    });

    it('fetches user streak with the current Firebase token', async () => {
      const mockResponse = { streak: 7 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.getStreakByUser();

      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getStreakByUser(), {
        headers: {
          Authorization: 'Bearer firebase-id-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches game streak with the current Firebase token', async () => {
      const mockResponse = { streak: 3 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.getStreakByGame(appId);

      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getStreakByGame(appId), {
        headers: {
          Authorization: 'Bearer firebase-id-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches the playtime report with the current Firebase token', async () => {
      const mockResponse = {
        date: '2026-08-18',
        game_reports: [{ app_id: '440', today_play_time: 120, streak: 2 }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.getPlaytimeReport('2026-08-05', '2026-08-18');

      expect(mockFetch).toHaveBeenCalledWith(
        EndPoints.getPlaytimeReport('2026-08-05', '2026-08-18'),
        {
          headers: {
            Authorization: 'Bearer firebase-id-token',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('fetches the day-by-day playtime with the current Firebase token', async () => {
      const mockResponse = [
        { date: '2026-08-17', playtime_minutes: 90 },
        { date: '2026-08-18', playtime_minutes: 150 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.getPlaytimeByUser(14);

      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getPlaytimeByUser(14), {
        headers: {
          Authorization: 'Bearer firebase-id-token',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('does not call streak endpoints without an active Firebase session', async () => {
      (auth as any).currentUser = null;

      await expect(ApiManager.getStreakByUser()).rejects.toThrow('No active Firebase user session');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches search users with the current Firebase token', async () => {
      const mockResponse = [
        { user: { id: 'u1', username: 'alex', steam_id: '123' }, friendship: {} },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.searchUsers('alex');
      expect(mockFetch).toHaveBeenCalledWith(EndPoints.searchUsers('alex'), {
        headers: { Authorization: 'Bearer firebase-id-token', 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches friend list with the current Firebase token', async () => {
      const mockResponse = [
        {
          user: { id: 'u2', username: 'bob', steam_id: '456' },
          friendship: { friendship_status: 'accepted' },
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.getFriendList();
      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getFriendList(), {
        headers: { Authorization: 'Bearer firebase-id-token', 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('sends friend request with POST method and body', async () => {
      const mockResponse = { message: 'Friend request sent', friendship_id: 'f1' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.addFriend('u2');
      expect(mockFetch).toHaveBeenCalledWith(EndPoints.addFriend(), {
        method: 'POST',
        headers: {
          Authorization: 'Bearer firebase-id-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addressee_id: 'u2' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('responds to friend request with POST method and body', async () => {
      const mockResponse = { message: 'Friend request accepted' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.respondToFriend('f1', 'ACCEPTED');
      expect(mockFetch).toHaveBeenCalledWith(EndPoints.respondToFriend(), {
        method: 'POST',
        headers: {
          Authorization: 'Bearer firebase-id-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendship_id: 'f1', action: 'ACCEPTED' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches recommendations for a friend', async () => {
      const mockResponse = { common_games: [], common_genres: [], top_games: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiManager.getRecommendations('u2');
      expect(mockFetch).toHaveBeenCalledWith(EndPoints.getRecommendations('u2'), {
        headers: { Authorization: 'Bearer firebase-id-token', 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  it('allows provider switching at runtime (currently all endpoints use steam)', async () => {
    setApiProvider('backend');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: { games: [] } }),
    });

    await ApiManager.getOwnedGames(steamId, false, false);

    // For now, all endpoints use Steam regardless of provider selection
    // Backend-specific endpoints will be implemented gradually as needed
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${getSteamApiKey()}&steamid=${steamId}&include_appinfo=true&include_free_sub=false&include_played_free_games=false`,
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
    );
  });
});

describe('fetchData', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  it('returns parsed JSON when response is ok', async () => {
    const payload = { value: 42 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    });

    const result = await fetchData<typeof payload>('https://example.dev/test');

    expect(mockFetch).toHaveBeenCalledWith('https://example.dev/test', expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }));
    expect(result).toEqual(payload);
  });

  it('throws descriptive error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchData('https://example.dev/missing')).rejects.toThrow(
      'HTTP error: 404. url Called: https://example.dev/missing'
    );
  });

  it('propagates fetch rejection errors', async () => {
    const networkError = new Error('Network down');
    mockFetch.mockRejectedValueOnce(networkError);

    await expect(fetchData('https://example.dev/error')).rejects.toThrow('Network down');
  });
});
