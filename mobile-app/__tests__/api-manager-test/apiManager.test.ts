import ApiManager from '@gamelog/api-manager/apiManager';
import ApiEndPoints from '@gamelog/api-manager/apiEndsPoints';

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
  });

  testHelper(
    'fetches game news successfully',
    'handles game news fetch failure',
    { newsitems: [{ title: 'News 1' }] },
    () => ApiManager.getGameNews(appId, 2, 300),
    ApiEndPoints.GET_NEWS_FOR_APP(appId, 2, 300)
  );

  testHelper(
    'fetches global achievement successfully',
    'handles global achievement fetch failure',
    { achievementpercentages: { achievements: [] } },
    () => ApiManager.getGlobalAchievement(appId),
    ApiEndPoints.GET_GLOBAL_ACHIEVEMENTS_FOR_APP(appId)
  );

  testHelper(
    'fetches player achievements successfully',
    'handles player achievements fetch failure',
    { playerstats: { achievements: [] } },
    () => ApiManager.getAllPlayerAchievementsPerApp(appId, steamId),
    ApiEndPoints.GET_PLAYER_ACHIEVEMENTS(appId, steamId)
  );

  testHelper(
    'fetches player stats successfully',
    'handles player stats fetch failure',
    { playerstats: { stats: [] } },
    () => ApiManager.getCompletedPlayerAchievementsAndStatsPerApp(appId, steamId),
    ApiEndPoints.GET_PLAYER_STATS(appId, steamId)
  );

  testHelper(
    'fetches players info successfully',
    'handles players info fetch failure',
    { response: [] },
    () => ApiManager.getPlayersInfo([steamId]),
    ApiEndPoints.GET_PLAYERS_INFO([steamId])
  );

  testHelper(
    'fetches player actual friends info successfully',
    'handles player friends info fetch failure',
    { friendslist: { friends: [] } },
    () => ApiManager.getPlayerFriendsInfo(steamId, false),
    ApiEndPoints.GET_PLAYER_FRIENDS_LIST(steamId, false)
  );

  testHelper(
    'fetches owned premium games successfully',
    'handles owned games fetch failure',
    { response: { games: [] } },
    () => ApiManager.getOwnedGames(steamId, false),
    ApiEndPoints.GET_OWNED_GAMES(steamId, false)
  );

  testHelper(
    'fetches recent played games successfully',
    'handles recent played games fetch failure',
    { response: { games: [] } },
    () => ApiManager.getRecentPlayedGames(steamId, 5),
    ApiEndPoints.GET_RECENT_PLAYED_GAMES(steamId, 5)
  );
});
