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
    useGetGameLibraryCoverImage, useGetPlayersInfo,
} from '@gamelog/api-manager/useApi';
import {renderHook} from "@testing-library/react-native";

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

function testApiHook<TResult extends Record<string, unknown>>({
                                                                  hook,
                                                                  apiMethod,
                                                                  apiArgs,
                                                                  expectedKeys,
                                                                  mockData,
                                                              }: {
    hook: () => TResult;
    apiMethod: keyof typeof ApiManager;
    apiArgs: unknown[];
    expectedKeys: { data: keyof TResult; loading: keyof TResult; error: keyof TResult };
    mockData: unknown;
}) {
    beforeEach(() => jest.clearAllMocks());

    it('returns loading state', () => {
        mockAsyncFetch({ isLoading: true });
        const { result } = renderHook(hook);
        expect(result.current[expectedKeys.data]).toBeNull();
        expect(result.current[expectedKeys.loading]).toBe(true);
        expect(result.current[expectedKeys.error]).toBeNull();
    });

    it('returns data on success', () => {
        mockAsyncFetch({ data: mockData });
        const { result } = renderHook(hook);
        expect(result.current[expectedKeys.data]).toEqual(mockData);
        expect(result.current[expectedKeys.loading]).toBe(false);
        expect(result.current[expectedKeys.error]).toBeNull();
    });

    it('returns error on failure', () => {
        const mockError = new Error('Network error');
        mockAsyncFetch({ error: mockError });
        const { result } = renderHook(hook);
        expect(result.current[expectedKeys.data]).toBeNull();
        expect(result.current[expectedKeys.error]).toEqual(mockError);
    });

    it('calls ApiManager with correct args', () => {
        mockAsyncFetch();
        renderHook(hook);
        const fetchFunc = mockUseAsyncFetch.mock.calls[0][0];
        fetchFunc();
        expect(mockApiManager[apiMethod]).toHaveBeenCalledWith(...apiArgs);
    });
}

describe('useGetPlayerAchievementsPerApp', () => {
    testApiHook({
        hook: () => useGetPlayerAchievementsPerApp('game-1', 'player-1'),
        apiMethod: 'getAllPlayerAchievementsPerApp',
        apiArgs: ['game-1', 'player-1'],
        expectedKeys: { data: 'personalAchievements', loading: 'isLoadingPlayerAchievement', error: 'errorPlayerAchievement' },
        mockData: [{ id: 'ach-1', name: 'First Win' }],
    });
});

describe('useGetGlobalAchievement', () => {
    testApiHook({
        hook: () => useGetGlobalAchievement('game-1'),
        apiMethod: 'getGlobalAchievement',
        apiArgs: ['game-1'],
        expectedKeys: { data: 'globalAchievements', loading: 'isLoadingGlobalAchievements', error: 'errorGlobalAchievements' },
        mockData: [{ id: 'global-1', percent: 42 }],
    });
});

describe('useGetOwnedGames', () => {
    testApiHook({
        hook: () => useGetOwnedGames('player-1', true),
        apiMethod: 'getOwnedGames',
        apiArgs: ['player-1', true],
        expectedKeys: { data: 'ownedGames', loading: 'isLoadingOwnedGames', error: 'errorOwnedGames' },
        mockData: [{ appid: 123, name: 'Half-Life' }],
    });
});

describe('useGetRecentPlayedGames', () => {
    testApiHook({
        hook: () => useGetRecentPlayedGames('player-1', 5),
        apiMethod: 'getRecentPlayedGames',
        apiArgs: ['player-1', 5],
        expectedKeys: { data: 'recentPlayedGames', loading: 'isLoadingRecentPlayedGames', error: 'errorRecentPlayedGames' },
        mockData: [{ appid: 456, name: 'Portal 2' }],
    });
});

describe('useGetGameLogoImage', () => {
    testApiHook({
        hook: () => useGetGameLogoImage('app-1', 'icon-url'),
        apiMethod: 'getGameLogoImage',
        apiArgs: ['app-1', 'icon-url'],
        expectedKeys: { data: 'gameLogoImage', loading: 'isLoadingGameLogoImage', error: 'errorGameLogoImage' },
        mockData: 'blob:logo-url',
    });
});

describe('useGetGameHeaderImage', () => {
    testApiHook({
        hook: () => useGetGameHeaderImage('app-1'),
        apiMethod: 'getGameHeaderImage',
        apiArgs: ['app-1'],
        expectedKeys: { data: 'gameHeaderImage', loading: 'isLoadingGameHeaderImage', error: 'errorGameHeaderImage' },
        mockData: 'blob:header-url',
    });
});

describe('useGetGameCapsuleImage', () => {
    testApiHook({
        hook: () => useGetGameCapsuleImage('app-1'),
        apiMethod: 'getGameCapsuleImage',
        apiArgs: ['app-1'],
        expectedKeys: { data: 'gameCapsuleImage', loading: 'isLoadingGameCapsuleImage', error: 'errorGameCapsuleImage' },
        mockData: 'blob:capsule-url',
    });
});

describe('useGetGameLibraryCoverImage', () => {
    testApiHook({
        hook: () => useGetGameLibraryCoverImage('app-1'),
        apiMethod: 'getGameLibraryCoverImage',
        apiArgs: ['app-1'],
        expectedKeys: { data: 'gameLibraryCoverImage', loading: 'isLoadingGameLibraryCoverImage', error: 'errorGameLibraryCoverImage' },
        mockData: 'blob:cover-url',
    });
});

//useGetPlayersInfo takes an array of steamIds
describe('useGetPlayersInfo', () => {
    it('calls ApiManager with correct steamIds', () => {
        mockUseAsyncFetch.mockReturnValue({ data: null, isLoading: false, error: null });

        const steamIds = ['id-1', 'id-2'];
        renderHook(() => useGetPlayersInfo(steamIds));

        const fetchFunc = mockUseAsyncFetch.mock.calls[0][0];
        fetchFunc();

        expect(mockApiManager.getPlayersInfo).toHaveBeenCalledWith(steamIds);
    });
});