import { GlobalAchievement } from '@gamelog/api-manager/dto';
import { useMemo } from 'react';
import AchievementItem from '@gamelog/game/AchievementItem';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { ScrollView } from 'react-native';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox, ErrorBox } from '@gamelog/common/feedbacks';
import { useGetPlayerAchievementsPerApp } from '@gamelog/api-manager/useApi';

type AchievementsListViewProps = {
  globalAchievements: GlobalAchievement;
  gameID: string;
  playerID: string;
};

const AchievementsListView = ({ route }: any) => {
  const { globalAchievements, gameID, playerID } = route.params as AchievementsListViewProps;

  const { personalAchievements, isLoadingPlayerAchievement, errorPlayerAchievement } =
    useGetPlayerAchievementsPerApp(gameID, playerID);

  const mergedAchievements = useMemo(() => {
    if (!isLoadingPlayerAchievement && !globalAchievements?.achievementpercentages?.achievements) {
      return [];
    }
    const personalList = personalAchievements?.playerstats?.achievements || [];
    const personalMap = new Map(personalList.map((ach) => [ach.apiname, ach]));

    return globalAchievements.achievementpercentages.achievements
      .map((globalAch) => {
        const personalAch = personalMap.get(globalAch.name);
        const isUnlocked = personalAch?.achieved === 1;

        return {
          name: globalAch.name,
          displayName: globalAch.displayName,
          percent: globalAch.percent,
          description: globalAch.description,
          unlockTime: isUnlocked ? personalAch.unlocktime : undefined,
        };
      })
      .sort((a, b) => {
        // unlocked first, then rarest-first within each group
        if (!!a.unlockTime !== !!b.unlockTime) return a.unlockTime ? -1 : 1;
        return a.percent - b.percent;
      });
  }, [globalAchievements, personalAchievements, isLoadingPlayerAchievement]);

  const unlockedCount = mergedAchievements.filter((a) => a.unlockTime).length;
  const totalCount = mergedAchievements.length;
  const completionPercent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return isLoadingPlayerAchievement ? (
    <LoadingBox className="flex-1" message="Loading achievements..." />
  ) : errorPlayerAchievement ? (
    <ErrorBox
      className="flex-1"
      errorMessage="Failed to load achievements, please try again later."
    />
  ) : (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
    >
      <Box className="mb-5">
        <Text size="3xl" className="font-bold uppercase text-center mb-3">
          Achievements
        </Text>

        <Box className="relative overflow-hidden border-2 border-outline-300 h-8 bg-background-100">
          <Box
            className="absolute top-0 left-0 h-full bg-success-500"
            style={{ width: `${completionPercent}%` }}
          />
          <HStack className="h-full items-center justify-center relative z-10">
            <Text size="sm" className="font-bold">
              {unlockedCount} / {totalCount} unlocked · {completionPercent}%
            </Text>
          </HStack>
        </Box>
      </Box>

      <VStack className="mb-4">
        {mergedAchievements.map((item, index) => (
          <AchievementItem
            key={index}
            name={item.name}
            displayName={item.displayName}
            percentage={item.percent}
            unlockTime={item.unlockTime}
            description={item.description}
          />
        ))}
      </VStack>
    </ScrollView>
  );
};

export default AchievementsListView;
