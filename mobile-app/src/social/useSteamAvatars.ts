import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAvatarFromCache, fetchSteamAvatars, subscribeToAvatarCache } from './steamAvatarCache';

export const useSteamAvatars = (steamIds: (string | undefined | null)[]) => {
  const rawKey = useMemo(() => {
    return (steamIds || [])
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      .sort()
      .join(',');
  }, [steamIds]);

  const normalizedIds = useMemo(() => {
    return rawKey ? rawKey.split(',') : [];
  }, [rawKey]);

  const normalizedIdsRef = useRef(normalizedIds);
  normalizedIdsRef.current = normalizedIds;

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const map: Record<string, string> = {};
    for (const id of normalizedIdsRef.current) {
      const url = getAvatarFromCache(id);
      if (url) {
        map[id] = url;
      }
    }
    return map;
  }, []);

  const [avatarMap, setAvatarMap] = useState<Record<string, string>>(getSnapshot);
  const [isLoading, setIsLoading] = useState(false);

  const loadMissingAvatars = useCallback(
    async (force = false) => {
      const ids = normalizedIdsRef.current;
      if (ids.length === 0) {
        if (isMountedRef.current) {
          setAvatarMap({});
        }
        return;
      }

      const missing = force || ids.some((id) => !getAvatarFromCache(id));
      if (missing) {
        if (isMountedRef.current) {
          setIsLoading(true);
        }
        try {
          await fetchSteamAvatars(ids);
        } finally {
          if (isMountedRef.current) {
            setIsLoading(false);
            setAvatarMap(getSnapshot());
          }
        }
      } else {
        if (isMountedRef.current) {
          setAvatarMap(getSnapshot());
        }
      }
    },
    [getSnapshot]
  );

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = subscribeToAvatarCache(() => {
      if (isMountedRef.current) {
        setAvatarMap(getSnapshot());
      }
    });

    return unsubscribe;
  }, [getSnapshot]);

  // Trigger fetch only when rawKey changes
  useEffect(() => {
    loadMissingAvatars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawKey]);

  const refetchAvatars = useCallback(() => {
    return loadMissingAvatars(true);
  }, [loadMissingAvatars]);

  return {
    avatarMap,
    isLoading,
    refetchAvatars,
  };
};

export const useSteamAvatar = (steamId?: string | null, autoFetch = false) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(() => getAvatarFromCache(steamId));
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!steamId) {
      setAvatarUrl(undefined);
      return;
    }

    const cached = getAvatarFromCache(steamId);
    setAvatarUrl(cached);

    if (!cached && autoFetch) {
      fetchSteamAvatars([steamId]);
    }

    const unsubscribe = subscribeToAvatarCache(() => {
      if (isMountedRef.current) {
        setAvatarUrl(getAvatarFromCache(steamId));
      }
    });

    return unsubscribe;
  }, [steamId, autoFetch]);

  return avatarUrl;
};
