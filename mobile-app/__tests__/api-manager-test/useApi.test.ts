import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import {
  useGetPlayerAchievementsPerApp,
  useGetGlobalAchievement,
  useGetOwnedGames,
  useGetPlayersInfo,
  useGetGameStreak,
  useGetUserStreak,
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
