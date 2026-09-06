import ApiManager from '@gamelog/api-manager/apiManager';
import {
  getAvatarFromCache,
  cachePlayerAvatars,
  fetchSteamAvatars,
  clearSteamAvatarCache,
  subscribeToAvatarCache,
  getAvatarCacheSnapshot,
} from '@gamelog/social/steamAvatarCache';

jest.mock('@gamelog/api-manager/apiManager');

const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

describe('steamAvatarCache', () => {
  beforeEach(() => {
    clearSteamAvatarCache();
    jest.clearAllMocks();
  });

  it('returns undefined for uncached or empty steam IDs', () => {
    expect(getAvatarFromCache()).toBeUndefined();
    expect(getAvatarFromCache(null)).toBeUndefined();
    expect(getAvatarFromCache('')).toBeUndefined();
    expect(getAvatarFromCache('non_existent')).toBeUndefined();
  });

  it('manually caches avatars and notifies listeners', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToAvatarCache(listener);

    cachePlayerAvatars([
      {
        steamid: '12345',
        avatarfull: 'https://example.com/avatar12345.jpg',
      },
    ]);

    expect(getAvatarFromCache('12345')).toBe('https://example.com/avatar12345.jpg');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    cachePlayerAvatars([
      {
        steamid: '67890',
        avatarfull: 'https://example.com/avatar67890.jpg',
      },
    ]);
    expect(listener).toHaveBeenCalledTimes(1); // Not called again after unsubscribe
  });

  it('falls back to avatarmedium or avatar if avatarfull is not present', () => {
    cachePlayerAvatars([
      {
        steamid: 'medium_user',
        avatarmedium: 'https://example.com/medium.jpg',
      },
      {
        steamid: 'small_user',
        avatar: 'https://example.com/small.jpg',
      },
    ]);

    expect(getAvatarFromCache('medium_user')).toBe('https://example.com/medium.jpg');
    expect(getAvatarFromCache('small_user')).toBe('https://example.com/small.jpg');
  });

  it('fetches missing avatars from ApiManager.getPlayersInfo and updates cache', async () => {
    mockApiManager.getPlayersInfo.mockResolvedValueOnce({
      response: {
        players: [
          {
            steamid: 'user1',
            avatarfull: 'https://example.com/user1.jpg',
          } as any,
          {
            steamid: 'user2',
            avatarfull: 'https://example.com/user2.jpg',
          } as any,
        ],
      },
    });

    const result = await fetchSteamAvatars(['user1', 'user2', '']);

    expect(mockApiManager.getPlayersInfo).toHaveBeenCalledWith(['user1', 'user2']);
    expect(result).toEqual({
      user1: 'https://example.com/user1.jpg',
      user2: 'https://example.com/user2.jpg',
    });
    expect(getAvatarFromCache('user1')).toBe('https://example.com/user1.jpg');
    expect(getAvatarFromCache('user2')).toBe('https://example.com/user2.jpg');
  });

  it('does not re-fetch already cached avatars', async () => {
    cachePlayerAvatars([
      {
        steamid: 'cached_user',
        avatarfull: 'https://example.com/cached.jpg',
      },
    ]);

    const result = await fetchSteamAvatars(['cached_user']);
    expect(mockApiManager.getPlayersInfo).not.toHaveBeenCalled();
    expect(result).toEqual({
      cached_user: 'https://example.com/cached.jpg',
    });
  });

  it('handles ApiManager errors gracefully without crashing', async () => {
    mockApiManager.getPlayersInfo.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchSteamAvatars(['error_user']);
    expect(result).toEqual({});
    expect(getAvatarFromCache('error_user')).toBeUndefined();
  });

  it('batches requests into groups of 100 steam IDs', async () => {
    const ids = Array.from({ length: 150 }, (_, i) => `steam_id_${i}`);

    mockApiManager.getPlayersInfo
      .mockResolvedValueOnce({
        response: {
          players: ids.slice(0, 100).map((id) => ({
            steamid: id,
            avatarfull: `https://example.com/${id}.jpg`,
          })) as any,
        },
      })
      .mockResolvedValueOnce({
        response: {
          players: ids.slice(100).map((id) => ({
            steamid: id,
            avatarfull: `https://example.com/${id}.jpg`,
          })) as any,
        },
      });

    const result = await fetchSteamAvatars(ids);

    expect(mockApiManager.getPlayersInfo).toHaveBeenCalledTimes(2);
    expect(mockApiManager.getPlayersInfo).toHaveBeenNthCalledWith(1, ids.slice(0, 100));
    expect(mockApiManager.getPlayersInfo).toHaveBeenNthCalledWith(2, ids.slice(100));
    expect(Object.keys(result).length).toBe(150);
  });

  it('getAvatarCacheSnapshot returns all currently cached avatars', () => {
    cachePlayerAvatars([
      { steamid: 'u1', avatarfull: 'https://example.com/1.jpg' },
      { steamid: 'u2', avatarfull: 'https://example.com/2.jpg' },
    ]);

    expect(getAvatarCacheSnapshot()).toEqual({
      u1: 'https://example.com/1.jpg',
      u2: 'https://example.com/2.jpg',
    });
  });

  it('clearSteamAvatarCache clears all data and notifies listeners', () => {
    cachePlayerAvatars([{ steamid: 'u1', avatarfull: 'https://example.com/1.jpg' }]);
    const listener = jest.fn();
    subscribeToAvatarCache(listener);

    clearSteamAvatarCache();

    expect(getAvatarFromCache('u1')).toBeUndefined();
    expect(listener).toHaveBeenCalled();
  });
});
