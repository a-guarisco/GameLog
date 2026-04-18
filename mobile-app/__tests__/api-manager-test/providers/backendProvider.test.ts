type BackendProviderModule = typeof import('@gamelog/api-manager/providers/backendProvider');

describe('backendApiClient', () => {
  const originalBackendBaseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  const loadModule = (backendBaseUrl?: string) => {
    jest.resetModules();

    if (backendBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL = backendBaseUrl;
    }

    const fetchDataMock = jest.fn(async (url: string) => ({ url }));

    jest.doMock('@gamelog/api-manager/providers/fetchData', () => ({
      fetchData: fetchDataMock,
    }));

    const module =
      require('@gamelog/api-manager/providers/backendProvider') as BackendProviderModule;

    return {
      backendApiClient: module.backendApiClient,
      fetchDataMock,
    };
  };

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    if (originalBackendBaseUrl === undefined) {
      delete process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL = originalBackendBaseUrl;
    }
  });

  it('uses default backend base URL when env var is missing', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    const result = await backendApiClient.getOwnedGames('7656119', false);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/players/7656119/games/owned?includeFreeGame=false'
    );
    expect(result).toEqual({
      url: 'http://localhost:8000/steam/players/7656119/games/owned?includeFreeGame=false',
    });
  });

  it('uses backend base URL from env var when provided', async () => {
    const { backendApiClient, fetchDataMock } = loadModule('https://api.mydomain.dev');

    await backendApiClient.getGameGenres('440');

    expect(fetchDataMock).toHaveBeenCalledWith('https://api.mydomain.dev/steam/apps/440/genres');
  });

  it('calls getGameNews with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getGameNews('440', 2, 300);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/news?appId=440&count=2&maxLength=300'
    );
  });

  it('calls getGlobalAchievement with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getGlobalAchievement('440');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/apps/440/global-achievements'
    );
  });

  it('calls getAllPlayerAchievementsPerApp with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getAllPlayerAchievementsPerApp('440', '7656119');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/apps/440/players/7656119/achievements'
    );
  });

  it('calls getCompletedPlayerAchievementsAndStatsPerApp with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getCompletedPlayerAchievementsAndStatsPerApp('440', '7656119');

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/apps/440/players/7656119/stats'
    );
  });

  it('calls getPlayersInfo with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getPlayersInfo(['7656119', '7656222']);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/players?steamIds=7656119,7656222'
    );
  });

  it('calls getPlayerFriendsInfo with includePending=false', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getPlayerFriendsInfo('7656119', false);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/players/7656119/friends?includePending=false'
    );
  });

  it('calls getPlayerFriendsInfo with includePending=true', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getPlayerFriendsInfo('7656119', true);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/players/7656119/friends?includePending=true'
    );
  });

  it('calls getOwnedGames with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getOwnedGames('7656119', true);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/players/7656119/games/owned?includeFreeGame=true'
    );
  });

  it('calls getRecentPlayedGames with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getRecentPlayedGames('7656119', 5);

    expect(fetchDataMock).toHaveBeenCalledWith(
      'http://localhost:8000/steam/players/7656119/games/recent?count=5'
    );
  });

  it('calls getGameGenres with expected URL', async () => {
    const { backendApiClient, fetchDataMock } = loadModule();

    await backendApiClient.getGameGenres('440');

    expect(fetchDataMock).toHaveBeenCalledWith('http://localhost:8000/steam/apps/440/genres');
  });
});
