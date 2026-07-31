import { GlobalAchievement, GameSchema } from '@gamelog/api-manager/dto';

export function mergeGlobalAchievementsWithSchema(
  globalAchievements: GlobalAchievement,
  gameSchema?: GameSchema | null
): GlobalAchievement {
  if (
    !globalAchievements?.achievementpercentages?.achievements ||
    !gameSchema?.game?.availableGameStats?.achievements
  ) {
    return globalAchievements;
  }

  const schemaMap = new Map(
    gameSchema.game.availableGameStats.achievements.map((item) => [item.name, item])
  );

  const enrichedAchievements = globalAchievements.achievementpercentages.achievements.map(
    (globalAch) => {
      const schemaAch = schemaMap.get(globalAch.name);
      return {
        ...globalAch,
        ...(schemaAch?.displayName !== undefined ? { displayName: schemaAch.displayName } : {}),
        ...(schemaAch?.description !== undefined ? { description: schemaAch.description } : {}),
      };
    }
  );

  return {
    ...globalAchievements,
    achievementpercentages: {
      ...globalAchievements.achievementpercentages,
      achievements: enrichedAchievements,
    },
  };
}
