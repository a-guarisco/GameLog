import { useNavigation, useRoute } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import GameStatusChips from '@gamelog/game/GameStatusChips';
import GameIdentity from '@gamelog/game/GameIdentity';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import GameStatBand from '@gamelog/common/StatBand';
import AchievementsSummary from '@gamelog/game/AchievementsSummary';
import GameScreenshotsStrip from '@gamelog/game/GameScreenshotsStrip';
import GameSectionTabs from '@gamelog/game/GameSectionTabs';
import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import useGameViewData from '@gamelog/game/useGameViewData';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';

const GameView = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { gameItem } = route.params;
  const playerID = getSteamId();

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
    gameStatus,
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
        <GameIdentity
          className="bg-background-0"
          title={gameItem.name}
          chips={
            <GameStatusChips
              livePlayers={livePlayers}
              streakText={streakText}
              appId={String(gameItem.appid)}
              status={gameStatus}
            />
          }
        />

        <Box className="pt-3 pb-6 bg-background-0">
          <VStack space="xl">
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

            <Box className="px-4">
              <Box className="border-t border-outline-100" />
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
