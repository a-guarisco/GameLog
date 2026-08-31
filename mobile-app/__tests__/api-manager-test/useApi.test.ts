import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import {
  useGetPlayerAchievementsPerApp,
  useGetGlobalAchievement,
  useGetOwnedGames,
  useGetPlayersInfo,
  useGetGameStreak,
  useGetUserStreak,
  useGetNumberOfCurrentPlayers,
  useGetGameNews,
  useGetGameGuides,
  useGetPlaytimeReport,
  useGetPlaytimeByUser,
} from '@gamelog/api-manager/useApi';
import { renderHook } from '@testing-library/react-native';

jest.mock('@gamelog/api-manager/apiManager');
jest.mock('@gamelog/common/useAsyncFetch');

const mockUseAsyncFetch = useAsyncFetch as jest.Mock;
const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

// ---- helper ----

type AsyncFetchState = { data: unknown; isLoading: boolean; error: unknown };

function mockAsyncFetch(overrides: Partial<AsyncFetchState> = {}) {
  mockUseAsyncFetch.mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    ...overrides,
  });
}

function useTestApiHook<TResult extends Record<string, unknown>>({
  useHook,
  apiMethod,
  apiArgs,
  expectedKeys,
  mockData,
}: {
  useHook: () => TResult;
  apiMethod: keyof typeof ApiManager;
  apiArgs: unknown[];
  expectedKeys: { data: keyof TResult; loading: keyof TResult; error: keyof TResult };
  mockData: unknown;
}) {
  beforeEach(() => jest.clearAllMocks());

  it('returns loading state', () => {
    mockAsyncFetch({ isLoading: true });
    const { result } = renderHook(useHook);
    expect(result.current[expectedKeys.data]).toBeNull();
    expect(result.current[expectedKeys.loading]).toBe(true);
    expect(result.current[expectedKeys.error]).toBeNull();
  });

  it('returns data on success', () => {
    mockAsyncFetch({ data: mockData });
    const { result } = renderHook(useHook);
    expect(result.current[expectedKeys.data]).toEqual(mockData);
    expect(result.current[expectedKeys.loading]).toBe(false);
    expect(result.current[expectedKeys.error]).toBeNull();
  });

  it('returns error on failure', () => {
    const mockError = new Error('Network error');
    mockAsyncFetch({ error: mockError });
    const { result } = renderHook(useHook);
    expect(result.current[expectedKeys.data]).toBeNull();
    expect(result.current[expectedKeys.error]).toEqual(mockError);
  });

  it('calls ApiManager with correct args', () => {
    mockAsyncFetch();
    renderHook(useHook);
    const fetchFunc = mockUseAsyncFetch.mock.calls[0][0];
    fetchFunc();
    expect(mockApiManager[apiMethod]).toHaveBeenCalledWith(...apiArgs);
  });
}

describe('useGetPlayerAchievementsPerApp', () => {
  useTestApiHook({
    useHook: () => useGetPlayerAchievementsPerApp('game-1', 'player-1'),
    apiMethod: 'getAllPlayerAchievementsPerApp',
    apiArgs: ['game-1', 'player-1'],
    expectedKeys: {
      data: 'personalAchievements',
      loading: 'isLoadingPlayerAchievement',
      error: 'errorPlayerAchievement',
    },
    mockData: [{ id: 'ach-1', name: 'First Win' }],
  });
});

describe('useGetGlobalAchievement', () => {
  useTestApiHook({
    useHook: () => useGetGlobalAchievement('game-1'),
    apiMethod: 'getGlobalAchievement',
    apiArgs: ['game-1'],
    expectedKeys: {
      data: 'globalAchievements',
      loading: 'isLoadingGlobalAchievements',
      error: 'errorGlobalAchievements',
    },
    mockData: [{ id: 'global-1', percent: 42 }],
  });
});

describe('useGetOwnedGames', () => {
  useTestApiHook({
    useHook: () => useGetOwnedGames('player-1', true, true),
    apiMethod: 'getOwnedGames',
    apiArgs: ['player-1', true, true],
    expectedKeys: { data: 'ownedGames', loading: 'isLoadingOwnedGames', error: 'errorOwnedGames' },
    mockData: [{ appid: 123, name: 'Half-Life' }],
  });
});

describe('useGetPlayersInfo', () => {
  useTestApiHook({
    useHook: () => useGetPlayersInfo(['steamId1', 'steamId2']),
    apiMethod: 'getPlayersInfo',
    apiArgs: [['steamId1', 'steamId2']],
    expectedKeys: {
      data: 'playersInfo',
      loading: 'isLoadingPlayersInfo',
      error: 'errorPlayersInfo',
    },
    mockData: [{ steamid: 'steamId1', personaname: 'PlayerOne' }],
  });
});

describe('useGetUserStreak', () => {
  useTestApiHook({
    useHook: useGetUserStreak,
    apiMethod: 'getStreakByUser',
    apiArgs: [],
    expectedKeys: {
      data: 'userStreak',
      loading: 'isLoadingUserStreak',
      error: 'errorUserStreak',
    },
    mockData: { streak: 5 },
  });

  it('normalizes numeric backend streak response to streak object', () => {
    mockAsyncFetch({ data: 14 });
    const { result } = renderHook(useGetUserStreak);
    expect(result.current.userStreak).toEqual({ streak: 14 });
  });
});

describe('useGetGameStreak', () => {
  useTestApiHook({
    useHook: () => useGetGameStreak('app-1'),
    apiMethod: 'getStreakByGame',
    apiArgs: ['app-1'],
    expectedKeys: {
      data: 'gameStreak',
      loading: 'isLoadingGameStreak',
      error: 'errorGameStreak',
    },
    mockData: { streak: 9 },
  });

  it('normalizes numeric backend streak response to streak object', () => {
    mockAsyncFetch({ data: 8 });
    const { result } = renderHook(() => useGetGameStreak('app-1'));
    expect(result.current.gameStreak).toEqual({ streak: 8 });
  });
});

describe('useGetNumberOfCurrentPlayers', () => {
  useTestApiHook({
    useHook: () => useGetNumberOfCurrentPlayers('730'),
    apiMethod: 'getNumberOfCurrentPlayers',
    apiArgs: ['730'],
    expectedKeys: {
      data: 'currentPlayers',
      loading: 'isLoadingCurrentPlayers',
      error: 'errorCurrentPlayers',
    },
    mockData: { response: { player_count: 652862, result: 1 } },
  });
});

describe('useGetPlaytimeByUser', () => {
  useTestApiHook({
    useHook: () => useGetPlaytimeByUser(),
    apiMethod: 'getPlaytimeByUser',
    apiArgs: [14],
    expectedKeys: {
      data: 'playtimeByUser',
      loading: 'isLoadingPlaytimeByUser',
      error: 'errorPlaytimeByUser',
    },
    mockData: [{ date: '2026-08-18', playtime_minutes: 90 }],
  });

  it('honours a custom window length', () => {
    mockAsyncFetch();
    renderHook(() => useGetPlaytimeByUser(30));

    mockUseAsyncFetch.mock.calls[0][0]();

    expect(mockApiManager.getPlaytimeByUser).toHaveBeenCalledWith(30);
  });
});

describe('useGetPlaytimeReport', () => {
  // Fixed clock so the trailing window resolves to known bounds.
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 18, 10, 30));
  });
  afterAll(() => jest.useRealTimers());

  useTestApiHook({
    useHook: () => useGetPlaytimeReport(),
    apiMethod: 'getPlaytimeReport',
    // 14 days inclusive of today: 2026-08-05 through 2026-08-18.
    apiArgs: ['2026-08-05', '2026-08-18'],
    expectedKeys: {
      data: 'playtimeReport',
      loading: 'isLoadingPlaytimeReport',
      error: 'errorPlaytimeReport',
    },
    mockData: {
      date: '2026-08-18',
      game_reports: [{ app_id: '730', today_play_time: 90, streak: 1 }],
    },
  });

  it('honours a custom window length', () => {
    mockAsyncFetch();
    renderHook(() => useGetPlaytimeReport(7));

    mockUseAsyncFetch.mock.calls[0][0]();

    expect(mockApiManager.getPlaytimeReport).toHaveBeenCalledWith('2026-08-12', '2026-08-18');
  });
});

describe('useGetGameNews', () => {
  useTestApiHook({
    useHook: () => useGetGameNews('730'),
    apiMethod: 'getGameNews',
    // Five items, and contents truncated to 1 char because the panel renders titles only.
    apiArgs: ['730', 5, 1],
    expectedKeys: {
      data: 'gameNews',
      loading: 'isLoadingGameNews',
      error: 'errorGameNews',
    },
    mockData: { appnews: { appid: 730, newsitems: [], count: 0 } },
  });

  it('lets a caller ask for a different number of items', () => {
    mockAsyncFetch();
    renderHook(() => useGetGameNews('730', 3));
    mockUseAsyncFetch.mock.calls[0][0]();
    expect(mockApiManager.getGameNews).toHaveBeenCalledWith('730', 3, 1);
  });
});

describe('useGetGameGuides', () => {
  useTestApiHook({
    useHook: () => useGetGameGuides('730'),
    apiMethod: 'getGameGuides',
    // Five guides from the first cursor: the panel shows one short page.
    apiArgs: ['730', '*', 5],
    expectedKeys: {
      data: 'gameGuides',
      loading: 'isLoadingGameGuides',
      error: 'errorGameGuides',
    },
    mockData: { response: { total: 812, publishedfiledetails: [] } },
  });
});

describe('useGetGameBasicInfo', () => {
  useTestApiHook({
    useHook: () => require('@gamelog/api-manager/useApi').useGetGameBasicInfo('730'),
    apiMethod: 'getGameBasicInfo',
    apiArgs: ['730'],
    expectedKeys: {
      data: 'gameBasicInfo',
      loading: 'isLoadingGameBasicInfo',
      error: 'errorGameBasicInfo',
    },
    mockData: { '730': { success: true, data: { name: 'CS2' } } },
  });
});

describe('useGetFullPlaytimeReport', () => {
  it('calls useGetPlaytimeReport with 10000 days', () => {
    mockAsyncFetch();
    const { useGetFullPlaytimeReport } = require('@gamelog/api-manager/useApi');
    const { result } = renderHook(() => useGetFullPlaytimeReport());
    expect(result.current.isLoadingPlaytimeReport).toBe(false);
  });
});

describe('useGetGameGenreChartData', () => {
  it('fetches owned games and formats genre chart data', async () => {
    mockAsyncFetch({ data: [{ genre: 'Action', value: 10 }] });
    const { useGetGameGenreChartData } = require('@gamelog/api-manager/useApi');
    const { result } = renderHook(() => useGetGameGenreChartData('u1', true, true));

    expect(result.current.genreChartData).toEqual([{ genre: 'Action', value: 10 }]);

    mockApiManager.getOwnedGames.mockResolvedValueOnce({
      response: {
        game_count: 1,
        games: [{ appid: 440, name: 'TF2', playtime_forever: 100 }],
      },
    } as any);

    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    const data = await fetchFunc();
    expect(mockApiManager.getOwnedGames).toHaveBeenCalledWith('u1', true, true);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('useGetGenresBatch', () => {
  it('returns empty object if appIds is empty', async () => {
    mockAsyncFetch({ data: {} });
    const { useGetGenresBatch } = require('@gamelog/api-manager/useApi');
    const { result } = renderHook(() => useGetGenresBatch([]));

    expect(result.current.libraryGenres).toEqual({});
    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    const res = await fetchFunc();
    expect(res).toEqual({});
    expect(mockApiManager.getGenresBatch).not.toHaveBeenCalled();
  });

  it('calls ApiManager when appIds is provided', async () => {
    mockAsyncFetch();
    const { useGetGenresBatch } = require('@gamelog/api-manager/useApi');
    renderHook(() => useGetGenresBatch(['440', '730']));

    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    await fetchFunc();
    expect(mockApiManager.getGenresBatch).toHaveBeenCalledWith(['440', '730']);
  });
});

describe('useGetFriendList', () => {
  it('fetches friend list and defaults to empty array', async () => {
    mockAsyncFetch({ data: null });
    const { useGetFriendList } = require('@gamelog/api-manager/useApi');
    const { result } = renderHook(() => useGetFriendList());

    expect(result.current.friendList).toEqual([]);
    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    await fetchFunc();
    expect(mockApiManager.getFriendList).toHaveBeenCalled();
  });
});

describe('useSearchUsers', () => {
  it('returns empty array when query is empty', async () => {
    mockAsyncFetch({ data: null });
    const { useSearchUsers } = require('@gamelog/api-manager/useApi');
    const { result } = renderHook(() => useSearchUsers('   '));

    expect(result.current.searchResults).toEqual([]);
    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    const res = await fetchFunc();
    expect(res).toEqual([]);
    expect(mockApiManager.searchUsers).not.toHaveBeenCalled();
  });

  it('searches users when query is present', async () => {
    mockAsyncFetch();
    const { useSearchUsers } = require('@gamelog/api-manager/useApi');
    renderHook(() => useSearchUsers('john'));

    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    await fetchFunc();
    expect(mockApiManager.searchUsers).toHaveBeenCalledWith('john');
  });
});

describe('useGetFriendRecommendations', () => {
  it('returns null when friendId is falsy', async () => {
    mockAsyncFetch({ data: null });
    const { useGetFriendRecommendations } = require('@gamelog/api-manager/useApi');
    const { result } = renderHook(() => useGetFriendRecommendations(null));

    expect(result.current.recommendations).toBeNull();
    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    const res = await fetchFunc();
    expect(res).toBeNull();
    expect(mockApiManager.getRecommendations).not.toHaveBeenCalled();
  });

  it('calls ApiManager with friendId when provided', async () => {
    mockAsyncFetch();
    const { useGetFriendRecommendations } = require('@gamelog/api-manager/useApi');
    renderHook(() => useGetFriendRecommendations('friend-123'));

    const fetchFunc = mockUseAsyncFetch.mock.lastCall[0];
    await fetchFunc();
    expect(mockApiManager.getRecommendations).toHaveBeenCalledWith('friend-123');
  });
});


