import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSteamAvatars, useSteamAvatar } from '@gamelog/social/useSteamAvatars';
import ApiManager from '@gamelog/api-manager/apiManager';
import { clearSteamAvatarCache, cachePlayerAvatars } from '@gamelog/social/steamAvatarCache';

jest.mock('@gamelog/api-manager/apiManager');

const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

describe('useSteamAvatars hook', () => {
  beforeEach(() => {
    clearSteamAvatarCache();
    jest.clearAllMocks();
  });

  it('returns empty map for empty steamIds array', () => {
    const { result } = renderHook(() => useSteamAvatars([]));

    expect(result.current.avatarMap).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches avatars for steamIds and returns avatarMap', async () => {
    mockApiManager.getPlayersInfo.mockResolvedValueOnce({
      response: {
        players: [
          {
            steamid: 'steam1',
            avatarfull: 'https://example.com/steam1.jpg',
          } as any,
        ],
      },
    });

    const { result } = renderHook(() => useSteamAvatars(['steam1']));

    await waitFor(() => {
      expect(result.current.avatarMap).toEqual({
        steam1: 'https://example.com/steam1.jpg',
      });
    });

    expect(mockApiManager.getPlayersInfo).toHaveBeenCalledWith(['steam1']);
  });

  it('allows manual refetching with refetchAvatars', async () => {
    mockApiManager.getPlayersInfo.mockResolvedValue({
      response: {
        players: [
          {
            steamid: 'steam1',
            avatarfull: 'https://example.com/steam1.jpg',
          } as any,
        ],
      },
    });

    const { result } = renderHook(() => useSteamAvatars(['steam1']));

    await waitFor(() => {
      expect(result.current.avatarMap['steam1']).toBe('https://example.com/steam1.jpg');
    });

    await act(async () => {
      await result.current.refetchAvatars();
    });

    expect(result.current.avatarMap['steam1']).toBe('https://example.com/steam1.jpg');
  });
});

describe('useSteamAvatar single hook', () => {
  beforeEach(() => {
    clearSteamAvatarCache();
    jest.clearAllMocks();
  });

  it('returns undefined when steamId is not provided', () => {
    const { result } = renderHook(() => useSteamAvatar(undefined));
    expect(result.current).toBeUndefined();
  });

  it('returns cached avatar immediately if available', () => {
    cachePlayerAvatars([
      {
        steamid: 'cached1',
        avatarfull: 'https://example.com/cached1.jpg',
      },
    ]);

    const { result } = renderHook(() => useSteamAvatar('cached1'));
    expect(result.current).toBe('https://example.com/cached1.jpg');
  });

  it('fetches and updates avatarUrl when uncached steamId is provided', async () => {
    mockApiManager.getPlayersInfo.mockResolvedValueOnce({
      response: {
        players: [
          {
            steamid: 'fetch1',
            avatarfull: 'https://example.com/fetch1.jpg',
          } as any,
        ],
      },
    });

    const { result } = renderHook(() => useSteamAvatar('fetch1', true));

    await waitFor(() => {
      expect(result.current).toBe('https://example.com/fetch1.jpg');
    });
  });
});
