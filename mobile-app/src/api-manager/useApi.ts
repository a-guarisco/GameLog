import ApiManager from '@gamelog/api-manager/apiManager';
import { useAsyncFetch } from '@gamelog/hooks/useAsyncFetch';
import { useCallback } from 'react';

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

  const { data, isLoading, error } = useAsyncFetch(fetchFunc);
  return {
    ownedGames: data,
    isLoadingOwnedGames: isLoading,
    errorOwnedGames: error,
  };
};
