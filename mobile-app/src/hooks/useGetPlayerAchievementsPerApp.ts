import { useState, useEffect } from 'react';
import { PlayerAchievement } from '@gamelog/api-manager/dto';
import ApiManager from '@gamelog/api-manager/apiManager';

export const useGetPlayerAchievementsPerApp = (gameID: number, playerID: string) => {
  const [personalAchievements, setPersonalAchievements] = useState<PlayerAchievement | null>(null);
  const [isLoadingPlayerAchievement, setIsLoadingPlayerAchievement] = useState(true);
  const [errorPlayerAchievement, setErrorPlayerAchievement] = useState<boolean>(false);

  useEffect(() => {
    setIsLoadingPlayerAchievement(true);
    setErrorPlayerAchievement(false);
    ApiManager.getAllPlayerAchievementsPerApp(gameID, playerID)
      .then(setPersonalAchievements)
      .catch((err) => {
        console.error('Failed to fetch personal achievements:', err);
        setErrorPlayerAchievement(true);
      })
      .finally(() => setIsLoadingPlayerAchievement(false));
  }, [gameID, playerID]);

  return { personalAchievements, isLoadingPlayerAchievement, errorPlayerAchievement };
};
