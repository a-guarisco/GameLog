import ApiManager, { setApiProvider } from '@gamelog/api-manager/apiManager';
import EndPoints from '@gamelog/api-manager/apiEndsPoints';

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

    expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
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
    'fetches global achievement successfully',
    'handles global achievement fetch failure',
    { achievementpercentages: { achievements: [] } },
    () => ApiManager.getGlobalAchievement(appId),
    EndPoints.getGlobalAchievementsForApp(appId)
  );

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
    () => ApiManager.getOwnedGames(steamId, false),
    EndPoints.getOwnedGames(steamId, false)
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

  it('allows provider switching at runtime (currently all endpoints use steam)', async () => {
    setApiProvider('backend');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: { games: [] } }),
    });

    await ApiManager.getOwnedGames(steamId, false);

    // For now, all endpoints use Steam regardless of provider selection
    // Backend-specific endpoints will be implemented gradually as needed
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=&steamid=${steamId}&include_appinfo=true&include_played_free_games=false`
    );
  });
});
