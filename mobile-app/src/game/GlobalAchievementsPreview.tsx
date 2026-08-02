import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import AchievementItem from '@gamelog/game/AchievementItem';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { Box } from '@gamelog/common/gluestack/box';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@gamelog/common/gluestack/text';
import { LoadingBox, ErrorBox } from '@gamelog/common/feedbacks';
import { useGetGlobalAchievement } from '@gamelog/api-manager/useApi';
import { Key } from 'react';

interface Props {
  gameID: string;
  playerID: string;
  gameItem?: {
    appid: string;
    name: string;
    streak?: number;
  };
}

export default function GlobalAchievementsBox({ gameID, playerID, gameItem }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { globalAchievements, isLoadingGlobalAchievements, errorGlobalAchievements } =
    useGetGlobalAchievement(gameID);

  const achievements = globalAchievements?.achievementpercentages.achievements || [];
  const topAchievements = achievements.slice(0, 3);
  const totalCount = achievements.length;

  return (
    <Box className="rounded-lg bg-background-100 p-5 w-full">
      <HStack className="items-center justify-center mb-4" space="sm">
        <Text size="2xl" className="font-bold tracking-widest uppercase text-center">
          Global Achievements
        </Text>
      </HStack>

      {isLoadingGlobalAchievements ? (
        <LoadingBox className="mb-4" message="Loading achievements..." />
      ) : errorGlobalAchievements ? (
        <ErrorBox
          className="mb-4"
          errorMessage="Failed to load global achievements, please try again later."
        />
      ) : (
        <VStack className="mb-4">
          {topAchievements.map(
            (
              item: { name: string; percent: number; displayName?: string; description?: string },
              index: Key | null | undefined
            ) => (
              <AchievementItem
                key={index}
                name={item.name}
                percentage={item.percent}
                displayName={item.displayName || item.name}
                description={item.description || ''}
              />
            )
          )}
        </VStack>
      )}

      <Button
        onPress={() =>
          navigation.navigate('AchievementsList', {
            globalAchievements,
            gameID,
            playerID,
            gameItem,
          })
        }
        className="w-full rounded-lg py-2"
      >
        <ButtonText className="font-bold uppercase">
          {totalCount > 3 ? `See all ${totalCount} achievements →` : 'See more →'}
        </ButtonText>
      </Button>
    </Box>
  );
}
