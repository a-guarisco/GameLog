import { GlobalAchievement } from '@gamelog/api-manager/dto';
import { useMemo } from 'react';
import AchievementItem from '@gamelog/game/AchievementItem';
import { VStack } from '@gamelog/components/ui/vstack';
import { ScrollView } from 'react-native';
import { Spinner } from '@gamelog/components/ui/spinner';
import { Text } from '@gamelog/components/ui/text';
import { Box } from '@gamelog/components/ui/box';
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

  //todo all of this should happen in the backend instead of merge here the 2 api call. The backend getPersonalAchievement should return global percentage along side the timestamp
  const mergedAchievements = useMemo(() => {
    if (!isLoadingPlayerAchievement && !globalAchievements?.achievementpercentages?.achievements) {
      console.log('No global achievements data available to merge with personal achievements.');
      return [];
    }
    const personalList = personalAchievements?.playerstats?.achievements || [];
    const personalMap = new Map(personalList.map((ach) => [ach.apiname, ach]));
    return globalAchievements.achievementpercentages.achievements.map((globalAch) => {
      const personalAch = personalMap.get(globalAch.name);
      const isUnlocked = personalAch?.achieved === 1;

      return {
        name: globalAch.name,
        percent: globalAch.percent,
        unlockTime: isUnlocked ? personalAch.unlocktime : undefined,
      };
    });
  }, [globalAchievements, personalAchievements, isLoadingPlayerAchievement]);

  return isLoadingPlayerAchievement ? (
    <Spinner size="large" className="mb-4" />
  ) : errorPlayerAchievement ? (
    <Text className="text-error-500 mb-4 text-center">
      Failed to load achievements, please try again later.
    </Text>
  ) : (
    <ScrollView className="mb-4">
      <Box>
        <Text size="3xl" className="font-bold uppercase text-center">
          Achievements for
        </Text>
        <Text size="3xl" className="font-bold uppercase mb-4 text-center">
          {personalAchievements?.playerstats?.gameName || 'Unknown Game'}
        </Text>
      </Box>

      <VStack className="mb-4">
        {mergedAchievements.map((item, index) => (
          <AchievementItem
            key={index}
            name={item.name}
            percentage={item.percent}
            unlockTime={item.unlockTime}
          />
        ))}
      </VStack>
    </ScrollView>
  );
};

export default AchievementsListView;
