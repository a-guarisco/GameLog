import { useCallback, useMemo, useState } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import { buildGenreChartData } from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import { toIsoDate } from '@gamelog/utils/formatUtils';
import { Streak, GameStatus } from './dto';


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

export const useGetGameBasicInfo = (gameID: string) => {
  const fetchFunc = useCallback(() => ApiManager.getGameBasicInfo(gameID), [gameID]);

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    gameBasicInfo: data,
    isLoadingGameBasicInfo: isLoading,
    errorGameBasicInfo: error,
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

export const RECENT_PLAYTIME_DAYS = 14;

const getRecentDateRange = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
};

export const useGetPlaytimeReport = (days: number = RECENT_PLAYTIME_DAYS) => {
  const { startDate, endDate } = useMemo(() => getRecentDateRange(days), [days]);

  const fetchFunc = useCallback(
    () => ApiManager.getPlaytimeReport(startDate, endDate),
    [startDate, endDate]
  );

  const { data, isLoading, error, errorMessage } = useAsyncFetch(fetchFunc);
  return {
    playtimeReport: data,
    isLoadingPlaytimeReport: isLoading,
    errorPlaytimeReport: error,
    errorMessagePlaytimeReport: errorMessage,
  };
};

export const useGetFullPlaytimeReport = () => {
  // 10000 days is ~27 years, which covers Steam's existence (since 2003)
  return useGetPlaytimeReport(10000);
};

/**
 * Per-day playtime across the library. The daily report answers "which games", this answers
 * "which days" � the profile trend needs the second, and only the backend has it.
 */
export const useGetPlaytimeByUser = (days: number = RECENT_PLAYTIME_DAYS) => {
  const fetchFunc = useCallback(() => ApiManager.getPlaytimeByUser(days), [days]);

  const { data, isLoading, error, errorMessage } = useAsyncFetch(fetchFunc);
  return {
    playtimeByUser: data,
    isLoadingPlaytimeByUser: isLoading,
    errorPlaytimeByUser: error,
    errorMessagePlaytimeByUser: errorMessage,
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

export const useGetGenresBatch = (appIds: string[]) => {
  const fetchFunc = useCallback(async () => {
    if (!appIds || appIds.length === 0) return {};
    const res = await ApiManager.getGenresBatch(appIds);
    if (!res) return {};
    if (Array.isArray(res)) {
      const map: Record<string, string[]> = {};
      for (const item of res) {
        map[item.app_id] = item.genres;
      }
      return map;
    }
    return res;
  }, [appIds]);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    libraryGenres: data,
    isLoadingLibraryGenres: isLoading,
    errorLibraryGenres: error,
    errorMessageLibraryGenres: errorMessage,
    refetchLibraryGenres: refetch,
  };
};

export const useGetUserGameStatuses = () => {
  const fetchFunc = useCallback(async () => {
    const res = await ApiManager.getUserGameStatuses();
    if (!res) return {};
    if (Array.isArray(res)) {
      const map: Record<string, GameStatus> = {};
      for (const item of res) {
        map[item.app_id] = item.status;
      }
      return map;
    }
    return res;
  }, []);



  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    userGameStatuses: data ?? {},
    isLoadingUserGameStatuses: isLoading,
    errorUserGameStatuses: error,
    errorMessageUserGameStatuses: errorMessage,
    refetchUserGameStatuses: refetch,
  };
};

export const useGetGameStatus = (gameID: string) => {
  const fetchFunc = useCallback(() => ApiManager.getGameStatus(gameID), [gameID]);

  const { data, isLoading, error, errorMessage, refetch } = useAsyncFetch(fetchFunc);
  return {
    gameStatus: data,
    isLoadingGameStatus: isLoading,
    errorGameStatus: error,
    errorMessageGameStatus: errorMessage,
    refetchGameStatus: refetch,
  };
};

export const useUpdateGameStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateStatus = useCallback(async (appId: string, status: GameStatus) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await ApiManager.updateGameStatus(appId, status);
      return res;
    } catch (err: any) {
      const msg = err?.message || 'Failed to update game status';
      setUpdateError(msg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateGameStatus: updateStatus,
    isUpdatingGameStatus: isUpdating,
    updateGameStatusError: updateError,
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

const GAME_FEED_COUNT = 5;
const GAME_NEWS_MAX_LENGTH = 1;

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

export { useGetGameScreenshots } from './useGetGameScreenshots';
export type { GameScreenshotsFetcher, UseGetGameScreenshotsResult } from './useGetGameScreenshots';

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
