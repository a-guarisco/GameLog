import { GlobalAchievement, PlayerAchievement } from '@gamelog/api-manager/dto';
import { GlobalPersonalAchievement } from './types';

const mergeGlobalPersonalAchievements = (
  globalAchievements: GlobalAchievement | undefined,
  personalAchievements: PlayerAchievement | undefined
): GlobalPersonalAchievement[] => {
  const globalList = globalAchievements?.achievementpercentages?.achievements;
  if (!globalList) return [];

  const personalList = personalAchievements?.playerstats?.achievements || [];
  const personalMap = new Map(personalList.map((ach) => [ach.apiname, ach]));

  return globalList
    .map((globalAch) => {
      const personalAch = personalMap.get(globalAch.name);
      const isUnlocked = personalAch?.achieved === 1;

      return {
        name: globalAch.name,
        displayName: globalAch.displayName || '',
        percent: globalAch.percent,
        description: globalAch.description || '',
        unlockTime: isUnlocked ? personalAch.unlocktime : undefined,
      };
    })
    .sort((a, b) => {
      if (!!a.unlockTime !== !!b.unlockTime) return a.unlockTime ? -1 : 1;
      return a.percent - b.percent;
    });
}

export default mergeGlobalPersonalAchievements;
