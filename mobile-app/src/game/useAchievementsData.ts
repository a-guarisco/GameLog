import { useMemo } from 'react';
import { GlobalAchievement } from '@gamelog/api-manager/dto';
import { useGetPlayerAchievementsPerApp } from '@gamelog/api-manager/useApi';
import mergeGlobalPersonalAchievements from './mergeGlobalPersonalAchievements';

const useAchievementsData = (
  gameID: string,
  playerID: string,
  globalAchievements: GlobalAchievement
) => {
  const { personalAchievements, isLoadingPlayerAchievement, errorPlayerAchievement } =
    useGetPlayerAchievementsPerApp(gameID, playerID);

  const mergedAchievements = useMemo(
    () => mergeGlobalPersonalAchievements(globalAchievements, personalAchievements ?? undefined),
    [globalAchievements, personalAchievements]
  );

  const unlockedCount = mergedAchievements.filter((a) => a.unlockTime).length;
  const totalCount = mergedAchievements.length;
  const completionPercent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const gameName = personalAchievements?.playerstats?.gameName ?? 'Unknown Game';

  return {
    mergedAchievements,
    unlockedCount,
    totalCount,
    completionPercent,
    gameName,
    isLoading: isLoadingPlayerAchievement,
    error: errorPlayerAchievement,
  };
};

export default useAchievementsData;
