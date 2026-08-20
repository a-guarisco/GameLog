import { useNavigation, useRoute } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import GameStatusChips from '@gamelog/game/GameStatusChips';
import BannerInfo from '@gamelog/common/BannerInfo';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import GameStatBand from '@gamelog/common/StatBand';
import AchievementsSummary from '@gamelog/game/AchievementsSummary';
import GameScreenshotsStrip from '@gamelog/game/GameScreenshotsStrip';
import GameSectionTabs from '@gamelog/game/GameSectionTabs';
import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import useGameViewData from '@gamelog/game/useGameViewData';

const GameView = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { gameItem } = route.params;
  const playerID = '76561198077919169'; //FIX

  const {
    streakText,
    globalAchievements,
    unlockedCount,
    totalCount,
    completionPercent,
    screenshots,
    totalScreenshots,
    loadMoreScreenshots,
    isLoadingScreenshots,
    isLoadingMoreScreenshots,
    livePlayers,
    stats,
  } = useGameViewData(gameItem, playerID);

  const openAchievementsList = () =>
    navigation.navigate('AchievementsList', {
      globalAchievements,
      gameID: gameItem.appid,
      playerID,
      gameItem,
    });

  return (
    <Box className="flex-1 relative">
      <HeaderGameImage appid={gameItem.appid} />

      <ScrollablePage>
        <BannerInfo className="bg-background-100 shadow-xl" title={gameItem.name} />

        <Box className="bg-background-100 shadow-xl pt-6 pb-6">
          <VStack space="xl">
            <GameStatusChips livePlayers={livePlayers} streakText={streakText} />

            <Box className="px-4">
              <GameStatBand stats={stats} />
            </Box>

            <Box className="px-4">
              <AchievementsSummary
                unlockedCount={unlockedCount}
                totalCount={totalCount}
                completionPercent={completionPercent}
                onPress={openAchievementsList}
              />
            </Box>

            <GameScreenshotsStrip
              screenshots={screenshots}
              totalCount={totalScreenshots}
              isLoading={isLoadingScreenshots}
              isLoadingMore={isLoadingMoreScreenshots}
              onEndReached={loadMoreScreenshots}
            />

            <Box className="px-4">
              <GameSectionTabs
                appid={gameItem.appid}
                achievementsSlot={
                  <GlobalAchievementsPreview
                    gameID={gameItem.appid}
                    playerID={playerID}
                    gameItem={gameItem}
                  />
                }
              />
            </Box>
          </VStack>
        </Box>
      </ScrollablePage>

      <BackButton onPress={() => navigation.goBack()} testID="game-back" />
    </Box>
  );
};

export default GameView;
