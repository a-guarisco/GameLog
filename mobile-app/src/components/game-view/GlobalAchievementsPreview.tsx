import { VStack } from '@gamelog/components/ui/vstack';
import AchievementItem from '@gamelog/components/game-view/AchievementItem';
import { Button, ButtonText } from '@gamelog/components/ui/button';
import { Box } from '@gamelog/components/ui/box';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spinner } from '@gamelog/components/ui/spinner';
import { Text } from '@gamelog/components/ui/text';
import { useGetGlobalAchievement } from '@gamelog/api-manager/useApi';

interface Props {
  gameID: number;
  playerID: string;
  gameItem?: {
    appid: number;
    name: string;
    streak?: number;
  };
}

export default function GlobalAchievementsBox({ gameID, playerID, gameItem }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { globalAchievements, isLoadingGlobalAchievements, errorGlobalAchievements } =
    useGetGlobalAchievement(gameID);

  const topAchievements = globalAchievements?.achievementpercentages.achievements.slice(0, 3) || [];

  return (
    <Box className="border-2 p-4 rounded-lg w-full">
      <Text size="2xl" className="font-bold tracking-widest uppercase mb-4 text-center">
        Global Achievements
      </Text>

      {isLoadingGlobalAchievements ? (
        <Spinner size="large" className="mb-4" />
      ) : errorGlobalAchievements ? (
        <Text className="text-error-500 mb-4 text-center">
          Failed to load global achievements, please try again later.
        </Text>
      ) : (
        <VStack className="mb-4">
          {topAchievements.map((item, index) => (
            <AchievementItem key={index} name={item.name} percentage={item.percent} />
          ))}
        </VStack>
      )}

      <Button
        onPress={() =>
          navigation.navigate('AchievementsList', {
            globalAchievements,
            gameID,
            playerID,
            ...(gameItem ? { game: gameItem } : {}),
          })
        }
        className="w-full py-2"
      >
        <ButtonText>See More</ButtonText>
      </Button>
    </Box>
  );
}
