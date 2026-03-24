import { useEffect, useState } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { GlobalAchievement } from '@gamelog/api-manager/dto';

export const useGetGlobalAchievement = (gameID: number) => {
  const [globalAchievements, setGlobalAchievements] = useState<GlobalAchievement>();
  const [isLoadingGlobalAchievements, setIsLoadingGlobalAchievements] = useState(true);
  const [errorGlobalAchievements, setErrorGlobalAchievements] = useState<boolean>(false);
  useEffect(() => {
    setErrorGlobalAchievements(false);
    ApiManager.getGlobalAchievement(gameID)
      .then(setGlobalAchievements)
      .catch((err) => {
        console.error('Failed to fetch global achievements:', err);
        setErrorGlobalAchievements(true);
      })
      .finally(() => setIsLoadingGlobalAchievements(false));
  }, [gameID]);

  return { globalAchievements, isLoadingGlobalAchievements, errorGlobalAchievements };
};
