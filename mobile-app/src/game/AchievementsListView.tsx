import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { GlobalAchievement } from '@gamelog/api-manager/dto';
import AchievementItem from '@gamelog/game/AchievementItem';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import GameIdentity from '@gamelog/game/GameIdentity';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import { useGetGameStreak } from '@gamelog/api-manager/useApi';
import { useStreakText } from '@gamelog/common/useStreakText';
import useAchievementsData from './useAchievementsData';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import AchievementsProgressBar from './AchievementsProgressBar';
import { useOrientation } from '@gamelog/common/useOrientation';

type AchievementsListViewProps = {
  globalAchievements: GlobalAchievement;
  gameID: string;
  playerID: string;
  gameItem?: any;
};

const AchievementsListView = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { isLandscape } = useOrientation();
  const { globalAchievements, gameID, playerID, gameItem } =
    route.params as AchievementsListViewProps;
  const { gameStreak, isLoadingGameStreak, refetchGameStreak } = useGetGameStreak(gameID);
  const secondaryText = useStreakText(gameStreak?.streak, isLoadingGameStreak);

  const {
    mergedAchievements,
    unlockedCount,
    totalCount,
    completionPercent,
    gameName,
    isLoading,
    error,
    refetchAchievements,
  } = useAchievementsData(gameID, playerID, globalAchievements);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchGameStreak?.(), refetchAchievements?.()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchGameStreak, refetchAchievements]);

  useEffect(() => {
    if (isLandscape) {
      const resolvedGameItem = gameItem ?? { appid: gameID, name: gameName };
      if (typeof navigation.canGoBack === 'function' && !navigation.canGoBack()) {
        if (typeof navigation.replace === 'function') {
          navigation.replace('Game', {
            gameItem: resolvedGameItem,
            showAchievements: true,
          });
          return;
        }
      }
      navigation.navigate('Game', {
        gameItem: resolvedGameItem,
        showAchievements: true,
      });
    }
  }, [isLandscape, navigation, gameItem, gameID, gameName]);

  if (isLandscape) {
    return null;
  }

  const content = isLoading ? (
    <LoadingBox className="flex-1 shadow-xl" message="Loading achievements..." />
  ) : error ? (
    <ErrorBox
      className="flex-1"
      errorMessage="Failed to load achievements, please try again later."
    />
  ) : (
    <>
      <HeaderGameImage appid={gameID} />
      <ScrollablePage refreshing={refreshing} onRefresh={handleRefresh}>
        <GameIdentity className="bg-background-0" title={gameName} secondaryText={secondaryText} />

        <Box className="pt-6 pb-6 bg-background-0">
          <VStack space="xl">
            <Box className="px-4">
              <AchievementsProgressBar
                gameName={gameName}
                unlockedCount={unlockedCount}
                totalCount={totalCount}
                completionPercent={completionPercent}
              />
            </Box>

            <Box className="px-4">
              {mergedAchievements.length === 0 ? (
                <InfoBox message="No achievements found for this game." />
              ) : (
                <VStack space="sm">
                  {mergedAchievements.map((item, index) => (
                    <AchievementItem
                      key={item.name || index}
                      name={item.name}
                      displayName={item.displayName}
                      percentage={item.percent}
                      unlockTime={item.unlockTime}
                      description={item.description}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Box>
      </ScrollablePage>
    </>
  );

  return (
    <Box className="flex-1 relative">
      {content}
      <BackButton onPress={() => navigation.goBack()} testID="achievements-back" />
    </Box>
  );
};

export default AchievementsListView;
