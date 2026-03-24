import { GlobalAchievement, PlayerAchievement } from '@gamelog/api-manager/dto';
import { useEffect, useState, useMemo } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import AchievementItem from '@gamelog/components/game-view/AchievementItem';
import { VStack } from '@gamelog/components/ui/vstack';
import { ScrollView } from 'react-native';
import { Spinner } from '@gamelog/components/ui/spinner';
import {Text} from "@gamelog/components/ui/text";
import {Box} from "@gamelog/components/ui/box";

type AchievementsListViewProps = {
  achievements: GlobalAchievement;
  gameID: number;
  playerID: string;
};

const AchievementsListView = ({ route }: any) => {
  const { achievements, gameID, playerID } = route.params as AchievementsListViewProps;
  const [personalAchievements, setPersonalAchievements] = useState<PlayerAchievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setError(false);
    ApiManager.getAllPlayerAchievementsPerApp(gameID, playerID)
      .then(setPersonalAchievements)
      .catch((err) => {
        console.error('Failed to fetch global achievements:', err);
        setError(true);
      })
      .finally(() => setIsLoading(false));
  }, [gameID, playerID]);

  //todo probably all of this should happen in the backend instead of merge here the 2 api call. The backend getPersonalAchievement should return global percentage along side the timestamp
  const mergedAchievements = useMemo(() => {
    if (!achievements?.achievementpercentages?.achievements) {
      return [];
    }
    const personalList = personalAchievements?.playerstats?.achievements || [];
    const personalMap = new Map(personalList.map((ach) => [ach.apiname, ach]));

    return achievements.achievementpercentages.achievements.map((globalAch) => {
      const personalAch = personalMap.get(globalAch.name);
      const isUnlocked = personalAch?.achieved === 1;

      return {
        name: globalAch.name,
        percent: globalAch.percent,
        unlockTime: isUnlocked ? personalAch.unlocktime : undefined,
      };
    });
  }, [achievements, personalAchievements]);

  return isLoading ? (
    <Spinner size="large" className="mb-4" />
  ) : error ? (
    <Text className="text-error-500 mb-4 text-center">
      Failed to load achievements, please try again later.
    </Text>
  ) : (
    <ScrollView className="mb-4">
      <Box>
        <Text
            size="3xl"
            className="font-bold uppercase text-center"
        >
          Achievements for
        </Text>
        <Text
            size="3xl"
            className="font-bold uppercase mb-4 text-center"
        >
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
