import { useCallback } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import { buildGenreChartData } from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import { Streak } from './dto';

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
    [playerID, includeFreeGame]
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
  }, [userId]);

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    genreChartData: data ?? [],
    isLoadingGenreChart: isLoading,
    errorGenreChart: error,
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
