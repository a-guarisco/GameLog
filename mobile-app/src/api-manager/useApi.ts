import { useCallback, useEffect, useRef, useState } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import { buildGenreChartData } from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import { PublishedFileDetails, Streak } from './dto';

export const useGetPlayerAchievementsPerApp = (gameID: string, playerID: string) => {
  const fetchFunc = useCallback(
    () => ApiManager.getAllPlayerAchievementsPerApp(gameID, playerID),
    [gameID, playerID]
  );

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    personalAchievements: data,
    isLoadingPlayerAchievement: isLoading,
    errorPlayerAchievement: error,
  };
};

export const useGetGlobalAchievement = (gameID: string) => {
  const fetchFunc = useCallback(() => ApiManager.getGlobalAchievement(gameID), [gameID]);

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    globalAchievements: data,
    isLoadingGlobalAchievements: isLoading,
    errorGlobalAchievements: error,
  };
};

export const useGetOwnedGames = (
  playerID: string,
  includeSub: boolean,
  includeFreeGame: boolean
) => {
  const fetchFunc = useCallback(
    () => ApiManager.getOwnedGames(playerID, includeSub, includeFreeGame),
    [playerID, includeSub, includeFreeGame]
  );

  const { data, isLoading, error, errorMessage } = useAsyncFetch(fetchFunc);
  return {
    ownedGames: data,
    isLoadingOwnedGames: isLoading,
    errorOwnedGames: error,
    errorMessageOwnedGames: errorMessage,
  };
};

export const useGetPlayersInfo = (steamIds: string[]) => {
  const fetchFunc = useCallback(() => ApiManager.getPlayersInfo(steamIds), [steamIds]);

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    playersInfo: data,
    isLoadingPlayersInfo: isLoading,
    errorPlayersInfo: error,
  };
};

type StreakResponse = Streak | number | null;

const normalizeStreak = (data: StreakResponse): Streak | null => {
  if (data === null) return null;
  return typeof data === 'number' ? { streak: data } : data;
};

export const useGetGameStreak = (gameID: string) => {
  const fetchFunc = useCallback(() => ApiManager.getStreakByGame(gameID), [gameID]);

  const { data, isLoading, error } = useAsyncFetch<Streak | number>(fetchFunc);
  return {
    gameStreak: normalizeStreak(data),
    isLoadingGameStreak: isLoading,
    errorGameStreak: error,
  };
};

export const useGetUserStreak = () => {
  const fetchFunc = useCallback(() => ApiManager.getStreakByUser(), []);

  const { data, isLoading, error } = useAsyncFetch<Streak | number>(fetchFunc);
  return {
    userStreak: normalizeStreak(data),
    isLoadingUserStreak: isLoading,
    errorUserStreak: error,
  };
};

export const useGetGameGenreChartData = (
  userId: string,
  includeSub: boolean,
  includeFreeGame: boolean
) => {
  const fetchFunc = useCallback(async () => {
    const ownedGames = await ApiManager.getOwnedGames(userId, includeSub, includeFreeGame);
    return buildGenreChartData(ownedGames.response.games);
  }, [userId, includeSub, includeFreeGame]);

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    genreChartData: data ?? [],
    isLoadingGenreChart: isLoading,
    errorGenreChart: error,
  };
};

export const useGetFriendList = () => {
  const fetchFunc = useCallback(() => ApiManager.getFriendList(), []);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    friendList: data ?? [],
    isLoadingFriendList: isLoading,
    errorFriendList: error,
    errorMessageFriendList: errorMessage,
    refetchFriendList: refetch,
  };
};

export const useSearchUsers = (query: string) => {
  const fetchFunc = useCallback(() => {
    if (!query.trim()) return Promise.resolve([]);
    return ApiManager.searchUsers(query);
  }, [query]);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    searchResults: data ?? [],
    isLoadingSearch: isLoading,
    errorSearch: error,
    errorMessageSearch: errorMessage,
    refetchSearch: refetch,
  };
};

export const useGetFriendRecommendations = (friendId: string | null) => {
  const fetchFunc = useCallback(() => {
    if (!friendId) return Promise.resolve(null);
    return ApiManager.getRecommendations(friendId);
  }, [friendId]);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    recommendations: data,
    isLoadingRecommendations: isLoading,
    errorRecommendations: error,
    errorMessageRecommendations: errorMessage,
    refetchRecommendations: refetch,
  };
};

export const useGetNumberOfCurrentPlayers = (appId: string) => {
  const fetchFunc = useCallback(() => ApiManager.getNumberOfCurrentPlayers(appId), [appId]);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    currentPlayers: data,
    isLoadingCurrentPlayers: isLoading,
    errorCurrentPlayers: error,
    errorMessageCurrentPlayers: errorMessage,
    refetchCurrentPlayers: refetch,
  };
};

/** Both feed panels under the game tabs show the same short list. */
const GAME_FEED_COUNT = 5;
/** The news panel renders titles only, so `contents` is truncated to the smallest payload. */
const GAME_NEWS_MAX_LENGTH = 1;

/** Steam has no cursor for news: `count` is the whole feed the panel gets. */
export const useGetGameNews = (appId: string, count: number = GAME_FEED_COUNT) => {
  const fetchFunc = useCallback(
    () => ApiManager.getGameNews(appId, count, GAME_NEWS_MAX_LENGTH),
    [appId, count]
  );

  const { data, isLoading, error, errorMessage } = useAsyncFetch(fetchFunc);
  return {
    gameNews: data,
    isLoadingGameNews: isLoading,
    errorGameNews: error,
    errorMessageGameNews: errorMessage,
  };
};

/**
 * Community guides for a game. The panel shows one short page, so the cursor stays at
 * the first one — paging is wired into the endpoint should a full guides screen land.
 */
export const useGetGameGuides = (appId: string, count: number = GAME_FEED_COUNT) => {
  const fetchFunc = useCallback(() => ApiManager.getGameGuides(appId, '*', count), [appId, count]);

  const { data, isLoading, error, errorMessage } = useAsyncFetch(fetchFunc);
  return {
    gameGuides: data,
    isLoadingGameGuides: isLoading,
    errorGameGuides: error,
    errorMessageGameGuides: errorMessage,
  };
};

const CAPTURES_PAGE_SIZE = 50;
const FIRST_CAPTURES_CURSOR = '*';

/**
 * Community screenshots for a game, paged through Steam's opaque cursor.
 * useAsyncFetch is not used here because pages have to accumulate across calls
 * instead of replacing the previous result.
 */
export const useGetGameCaptures = (appId: string, pageSize: number = CAPTURES_PAGE_SIZE) => {
  const [captures, setCaptures] = useState<PublishedFileDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cursorRef = useRef(FIRST_CAPTURES_CURSOR);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  // Bumped whenever the game changes, so a page that resolves late cannot append
  // another game's screenshots to the list.
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const loadPage = useCallback(
    async (cursor: string, requestId: number) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const isFirstPage = cursor === FIRST_CAPTURES_CURSOR;
      if (isFirstPage) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const { response } = await ApiManager.getGameCaptures(appId, cursor, pageSize);
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;

        // Screenshots without an image_url cannot be rendered, so they never reach the UI.
        const page = (response.publishedfiledetails ?? []).filter((file) => !!file.image_url);
        const nextCursor = response.next_cursor;

        setTotal(response.total ?? 0);
        setCaptures((previous) => {
          const seen = new Set(previous.map((file) => file.publishedfileid));
          return [...previous, ...page.filter((file) => !seen.has(file.publishedfileid))];
        });
        // Steam echoes the same cursor back once the result set is exhausted.
        cursorRef.current = nextCursor ?? cursor;
        setHasMore(page.length > 0 && !!nextCursor && nextCursor !== cursor);
        setErrorMessage(null);
      } catch (err: unknown) {
        if (!isMountedRef.current || requestId !== requestIdRef.current) return;
        console.error('Error fetching game captures:', err);
        setErrorMessage(
          err instanceof Error ? err.message : 'An error occurred while fetching screenshots.'
        );
        setHasMore(false);
      } finally {
        isFetchingRef.current = false;
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [appId, pageSize]
  );

  useEffect(() => {
    requestIdRef.current += 1;
    isFetchingRef.current = false;
    cursorRef.current = FIRST_CAPTURES_CURSOR;
    setCaptures([]);
    setTotal(0);
    setHasMore(true);
    setErrorMessage(null);
    loadPage(FIRST_CAPTURES_CURSOR, requestIdRef.current);
  }, [loadPage]);

  const loadMoreCaptures = useCallback(() => {
    if (isFetchingRef.current || !hasMore) return;
    loadPage(cursorRef.current, requestIdRef.current);
  }, [hasMore, loadPage]);

  return {
    captures,
    totalCaptures: total,
    hasMoreCaptures: hasMore,
    loadMoreCaptures,
    isLoadingCaptures: isLoading,
    isLoadingMoreCaptures: isLoadingMore,
    errorCaptures: !!errorMessage,
    errorMessageCaptures: errorMessage,
  };
};

// export const useGetBackendHealth = () => {
//   const fetchFunc = useCallback(() => ApiManager.getBackendHealth(), []);

//   const { data, isLoading, error } = useAsyncFetch(fetchFunc);
//   return {
//     backendHealth: data,
//     isLoadingBackendHealth: isLoading,
//     errorBackendHealth: error,
//   };
// };

// export const useGetAuthOutcome = (token: string) => {
//   const fetchFunc = useCallback(() => ApiManager.getAuthOutcome(token), [token]);

//   const { data, isLoading, error } = useAsyncFetch(fetchFunc);
//   return {
//     authOutcome: data,
//     isLoadingAuthOutcome: isLoading,
//     errorAuthOutcome: error,
//   };
// };
