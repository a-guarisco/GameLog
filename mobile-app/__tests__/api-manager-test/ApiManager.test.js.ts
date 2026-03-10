import ApiManager from '../../src/api-manager/ApiManager';
import ApiEndPoints from '../../src/api-manager/ApiEndPoints';

global.fetch = jest.fn();

const appId = 440;
const steamId = '76561198077919169';

const testHelper = (
  testNameSuccess: string,
  testNameFail: string,
  mockResponse: any,
  apiFunction: () => Promise<any>,
  expectedUrl: string
) => {
  it(testNameSuccess, async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    const result = await apiFunction();
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockResponse);
  });

  it(testNameFail, async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });
    await expect(apiFunction()).rejects.toThrow('HTTP error: 404');
  });
};

describe('ApiManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  testHelper(
    'fetches game news successfully',
    'handles game news fetch failure',
    { newsitems: [{ title: 'News 1' }, { title: 'News 2' }] },
    () => ApiManager.getGameNews(appId, 2, 300),
    ApiEndPoints.GET_NEWS_FOR_APP(appId, 2, 300)
  );

  testHelper(
    'fetches global achievement successfully',
    'handles global achievement fetch failure',
    { achievementpercentages: { achievements: [{ name: 'AchievementName', percent: 50 }] } },
    () => ApiManager.getGlobalAchievement(appId),
    ApiEndPoints.GET_GLOBAL_ACHIEVEMENTS_FOR_APP(appId)
  );

  testHelper(
    'fetches player achievements successfully',
    'handles player achievements fetch failure',
    { playerstats: { achievements: [{ name: 'AchievementName', achieved: 1 }] } },
    () => ApiManager.getAllPlayerAchievementsPerApp(appId, steamId),
    ApiEndPoints.GET_PLAYER_ACHIEVEMENTS(appId, steamId)
  );

  testHelper(
    'fetches player stats successfully',
    'handles player stats fetch failure',
    { playerstats: { stats: [{ name: 'StatName', value: 100 }] } },
    () => ApiManager.getCompletedPlayerAchievementsAndStatsPerApp(appId, steamId),
    ApiEndPoints.GET_PLAYER_STATS(appId, steamId)
  );

  testHelper(
    'fetches players info successfully',
    'handles players info fetch failure',
    { response: [{ steamid: steamId, personaname: 'PlayerName' }] },
    () => ApiManager.getPlayersInfo([steamId]),
    ApiEndPoints.GET_PLAYERS_INFO([steamId])
  );

  testHelper(
    'fetches player actual friends info successfully',
    'handles player friends info fetch failure',
    { friendslist: { friends: [{ steamid: steamId, relationship: 'friend' }] } },
    () => ApiManager.getPlayerFriendsInfo(steamId, false),
    ApiEndPoints.GET_PLAYER_FRIENDS_LIST(steamId, false)
  );

  testHelper(
    'fetches player pending friends info successfully',
    'handles player pending friends info fetch failure',
    { friendslist: { friends: [{ steamid: steamId, relationship: 'pending' }] } },
    () => ApiManager.getPlayerFriendsInfo(steamId, true),
    ApiEndPoints.GET_PLAYER_FRIENDS_LIST(steamId, true)
  );

  testHelper(
    'fetches owned premium games successfully',
    'handles owned games fetch failure',
    { response: { game_count: 1, games: [{ appid: appId, name: 'GameName' }] } },
    () => ApiManager.getOwnedGames(steamId, false),
    ApiEndPoints.GET_OWNED_GAMES(steamId, false)
  );

  testHelper(
    'fetches owned games including free games successfully',
    'handles owned games including free games fetch failure',
    {
      response: {
        game_count: 2,
        games: [
          { appid: appId, name: 'GameName' },
          { appid: 570, name: 'FreeGameName' },
        ],
      },
    },
    () => ApiManager.getOwnedGames(steamId, true),
    ApiEndPoints.GET_OWNED_GAMES(steamId, true)
  );

  testHelper(
    'fetches recent played games successfully',
    'handles recent played games fetch failure',
    { response: { total_count: 1, games: [{ appid: appId, name: 'GameName' }] } },
    () => ApiManager.getRecentPlayedGames(steamId, 5),
    ApiEndPoints.GET_RECENT_PLAYED_GAMES(steamId, 5)
  );
});
