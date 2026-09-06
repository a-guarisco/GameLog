import ApiManager from '@gamelog/api-manager/apiManager';
import type { PlayerPublicInfo } from '@gamelog/api-manager/dto';

const avatarCache = new Map<string, string>();
const inFlightIds = new Set<string>();
const listeners = new Set<() => void>();

const STEAM_BATCH_SIZE = 100;

export const notifyAvatarCacheListeners = (): void => {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.warn('Error in avatar cache listener callback:', err);
    }
  });
};

export const subscribeToAvatarCache = (callback: () => void): (() => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

export const getAvatarFromCache = (steamId?: string | null): string | undefined => {
  if (!steamId) return undefined;
  return avatarCache.get(steamId);
};

export const cachePlayerAvatars = (
  players?: Pick<PlayerPublicInfo, 'steamid' | 'avatarfull' | 'avatarmedium' | 'avatar'>[]
): void => {
  if (!Array.isArray(players) || players.length === 0) return;

  let changed = false;
  for (const player of players) {
    const avatarUrl = player.avatarfull || player.avatarmedium || player.avatar;
    if (player.steamid && avatarUrl) {
      if (avatarCache.get(player.steamid) !== avatarUrl) {
        avatarCache.set(player.steamid, avatarUrl);
        changed = true;
      }
    }
  }

  if (changed) {
    notifyAvatarCacheListeners();
  }
};

export const fetchSteamAvatars = async (
  steamIds: (string | undefined | null)[]
): Promise<Record<string, string>> => {
  const validIds = [
    ...new Set(
      steamIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    ),
  ];

  const missingIds = validIds.filter((id) => !avatarCache.has(id) && !inFlightIds.has(id));

  if (missingIds.length > 0) {
    missingIds.forEach((id) => inFlightIds.add(id));

    try {
      for (let i = 0; i < missingIds.length; i += STEAM_BATCH_SIZE) {
        const batch = missingIds.slice(i, i + STEAM_BATCH_SIZE);
        try {
          const response = await ApiManager.getPlayersInfo(batch);
          const players = response?.response?.players;
          if (Array.isArray(players) && players.length > 0) {
            for (const player of players) {
              const avatarUrl = player.avatarfull || player.avatarmedium || player.avatar;
              if (player.steamid && avatarUrl) {
                avatarCache.set(player.steamid, avatarUrl);
              }
            }
          }
        } catch (err) {
          console.warn('Failed to fetch Steam avatars for batch:', err);
        } finally {
          batch.forEach((id) => inFlightIds.delete(id));
        }
      }
    } finally {
      notifyAvatarCacheListeners();
    }
  }

  const result: Record<string, string> = {};
  for (const id of validIds) {
    const cachedUrl = avatarCache.get(id);
    if (cachedUrl) {
      result[id] = cachedUrl;
    }
  }

  return result;
};

export const getAvatarCacheSnapshot = (): Record<string, string> => {
  const snapshot: Record<string, string> = {};
  avatarCache.forEach((url, steamId) => {
    snapshot[steamId] = url;
  });
  return snapshot;
};

export const clearSteamAvatarCache = (): void => {
  avatarCache.clear();
  inFlightIds.clear();
  notifyAvatarCacheListeners();
};
