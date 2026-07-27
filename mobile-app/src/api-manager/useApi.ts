import { useCallback } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import { buildGenreChartData } from '@gamelog/common/charts/genre-radar/buildGenreChartData';

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

export const useGetOwnedGames = (playerID: string, includeFreeGame: boolean) => {
  const fetchFunc = useCallback(
    () => ApiManager.getOwnedGames(playerID, includeFreeGame),
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

export const useGetGameGenreChartData = (userId: string) => {
  const fetchFunc = useCallback(async () => {
    const ownedGames = await ApiManager.getOwnedGames(userId, false);
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
