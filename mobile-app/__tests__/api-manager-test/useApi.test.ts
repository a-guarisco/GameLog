import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/hooks/useAsyncFetch';
import {
  useGetPlayerAchievementsPerApp,
  useGetGlobalAchievement,
  useGetOwnedGames,
  useGetRecentPlayedGames,
  useGetGameLogoImage,
  useGetGameHeaderImage,
  useGetGameCapsuleImage,
  useGetGameLibraryCoverImage,
} from '@gamelog/api-manager/useApi';
import { renderHook } from '@testing-library/react-native';

jest.mock('@gamelog/api-manager/apiManager');
jest.mock('@gamelog/hooks/useAsyncFetch');

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
    useHook: () => useGetOwnedGames('player-1', true),
    apiMethod: 'getOwnedGames',
    apiArgs: ['player-1', true],
    expectedKeys: { data: 'ownedGames', loading: 'isLoadingOwnedGames', error: 'errorOwnedGames' },
    mockData: [{ appid: 123, name: 'Half-Life' }],
  });
});

describe('useGetRecentPlayedGames', () => {
  useTestApiHook({
    useHook: () => useGetRecentPlayedGames('player-1', 5),
    apiMethod: 'getRecentPlayedGames',
    apiArgs: ['player-1', 5],
    expectedKeys: {
      data: 'recentPlayedGames',
      loading: 'isLoadingRecentPlayedGames',
      error: 'errorRecentPlayedGames',
    },
    mockData: [{ appid: 456, name: 'Portal 2' }],
  });
});

describe('useGetGameLogoImage', () => {
  useTestApiHook({
    useHook: () => useGetGameLogoImage('app-1', 'icon-url'),
    apiMethod: 'getGameLogoImage',
    apiArgs: ['app-1', 'icon-url'],
    expectedKeys: {
      data: 'gameLogoImage',
      loading: 'isLoadingGameLogoImage',
      error: 'errorGameLogoImage',
    },
    mockData: 'blob:logo-url',
  });
});

describe('useGetGameHeaderImage', () => {
  useTestApiHook({
    useHook: () => useGetGameHeaderImage('app-1'),
    apiMethod: 'getGameHeaderImage',
    apiArgs: ['app-1'],
    expectedKeys: {
      data: 'gameHeaderImage',
      loading: 'isLoadingGameHeaderImage',
      error: 'errorGameHeaderImage',
    },
    mockData: 'blob:header-url',
  });
});

describe('useGetGameCapsuleImage', () => {
  useTestApiHook({
    useHook: () => useGetGameCapsuleImage('app-1'),
    apiMethod: 'getGameCapsuleImage',
    apiArgs: ['app-1'],
    expectedKeys: {
      data: 'gameCapsuleImage',
      loading: 'isLoadingGameCapsuleImage',
      error: 'errorGameCapsuleImage',
    },
    mockData: 'blob:capsule-url',
  });
});

describe('useGetGameLibraryCoverImage', () => {
  useTestApiHook({
    useHook: () => useGetGameLibraryCoverImage('app-1'),
    apiMethod: 'getGameLibraryCoverImage',
    apiArgs: ['app-1'],
    expectedKeys: {
      data: 'gameLibraryCoverImage',
      loading: 'isLoadingGameLibraryCoverImage',
      error: 'errorGameLibraryCoverImage',
    },
    mockData: 'blob:cover-url',
  });
});
