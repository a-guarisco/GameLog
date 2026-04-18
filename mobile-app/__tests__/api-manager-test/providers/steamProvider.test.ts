type SteamProviderModule = typeof import('@gamelog/api-manager/providers/steamProvider');

describe('steamProvider', () => {
  const originalSteamApiKey = process.env.EXPO_PUBLIC_STEAM_API_KEY;

  const loadModule = (steamApiKey = 'test-steam-key') => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_STEAM_API_KEY = steamApiKey;

    const fetchDataMock = jest.fn(async (url: string) => ({ url }));

    jest.doMock('@gamelog/api-manager/providers/fetchData', () => ({
      fetchData: fetchDataMock,
    }));

    const module = require('@gamelog/api-manager/providers/steamProvider') as SteamProviderModule;

    return {
      steamApiClient: module.steamApiClient,
      steamApiEndpoints: module.steamApiEndpoints,
      fetchDataMock,
    };
  };

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    if (originalSteamApiKey === undefined) {
      delete process.env.EXPO_PUBLIC_STEAM_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_STEAM_API_KEY = originalSteamApiKey;
    }
  });

  it('builds all steam endpoints correctly', async () => {
    const { steamApiEndpoints } = loadModule('abc123');

    expect(steamApiEndpoints.getNewsForApp('440', 2, 300)).toBe(
      'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=440&count=2&maxlength=300'
    );
    expect(steamApiEndpoints.getGlobalAchievementsForApp('440')).toBe(
      'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=440'
    );
    expect(steamApiEndpoints.getPlayerAchievements('440', '7656119')).toBe(
      'https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=abc123&steamid=7656119'
    );
    expect(steamApiEndpoints.getPlayersInfo(['1', '2'])).toBe(
      'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=abc123&steamids=1,2'
    );
    expect(steamApiEndpoints.getPlayerStats('440', '7656119')).toBe(
      'https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key=abc123&steamid=7656119'
    );
    expect(steamApiEndpoints.getOwnedGames('7656119', true)).toBe(
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=abc123&steamid=7656119&include_appinfo=true&include_played_free_games=true'
    );
    expect(steamApiEndpoints.getRecentPlayedGames('7656119', 5)).toBe(
      'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=abc123&steamid=7656119&count=5'
    );
    expect(steamApiEndpoints.getGameGenres('440')).toBe(
      'https://store.steampowered.com/api/appdetails?appids=440&filters=genres'
    );
  });

  it('builds friends endpoint with friend relationship when includePending is false', async () => {
    const { steamApiEndpoints } = loadModule('abc123');

    expect(steamApiEndpoints.getPlayerFriendsList('7656119', false)).toBe(
      'https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=abc123&steamid=7656119&relationship=friend'
    );
  });

  it('builds friends endpoint with all relationship when includePending is true', async () => {
    const { steamApiEndpoints } = loadModule('abc123');

    expect(steamApiEndpoints.getPlayerFriendsList('7656119', true)).toBe(
      'https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=abc123&steamid=7656119&relationship=all'
    );
  });

  it('calls getGameNews with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    const result = await steamApiClient.getGameNews('440', 2, 300);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=440&count=2&maxlength=300'
    );
    expect(result).toEqual({
      url: 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=440&count=2&maxlength=300',
    });
  });

  it('calls getGlobalAchievement with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getGlobalAchievement('440');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=440'
    );
  });

  it('calls getAllPlayerAchievementsPerApp with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getAllPlayerAchievementsPerApp('440', '7656119');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=abc123&steamid=7656119'
    );
  });

  it('calls getCompletedPlayerAchievementsAndStatsPerApp with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getCompletedPlayerAchievementsAndStatsPerApp('440', '7656119');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key=abc123&steamid=7656119'
    );
  });

  it('calls getPlayersInfo with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getPlayersInfo(['1', '2']);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=abc123&steamids=1,2'
    );
  });

  it('calls getPlayerFriendsInfo with includePending=false', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getPlayerFriendsInfo('7656119', false);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=abc123&steamid=7656119&relationship=friend'
    );
  });

  it('calls getPlayerFriendsInfo with includePending=true', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getPlayerFriendsInfo('7656119', true);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=abc123&steamid=7656119&relationship=all'
    );
  });

  it('calls getOwnedGames with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getOwnedGames('7656119', true);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=abc123&steamid=7656119&include_appinfo=true&include_played_free_games=true'
    );
  });

  it('calls getRecentPlayedGames with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getRecentPlayedGames('7656119', 5);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=abc123&steamid=7656119&count=5'
    );
  });

  it('calls getGameGenres with expected URL', async () => {
    const { steamApiClient, fetchDataMock } = loadModule('abc123');

    await steamApiClient.getGameGenres('440');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'https://store.steampowered.com/api/appdetails?appids=440&filters=genres'
    );
  });
});
