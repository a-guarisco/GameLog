import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrientation } from '@gamelog/common/useOrientation';
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
import GameScreenshotsGrid from '@gamelog/game/GameScreenshotsGrid';
import GameSectionTabs from '@gamelog/game/GameSectionTabs';
import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import InlineAchievementsDetail from '@gamelog/game/InlineAchievementsDetail';
import useGameViewData from '@gamelog/game/useGameViewData';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';

const GameView = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const [showInlineAchievements, setShowInlineAchievements] = useState(false);
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
    refetchGameStatus,
  } = useGameViewData(gameItem, playerID);

  const openAchievementsList = () =>
    navigation.navigate('AchievementsList', {
      globalAchievements,
      gameID: gameItem.appid,
      playerID,
      gameItem,
    });

  if (!isLandscape) {
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
                onStatusChange={refetchGameStatus}
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
  }

  const leftRailOffset = insets.left + 74;
  const bannerHeight = isTablet ? 280 : 120;

  return (
    <Box
      className="flex-1 bg-background-0"
      style={{
        paddingLeft: leftRailOffset,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Full-width Game Banner spanning across both columns */}
      <Box className="w-full relative" style={{ height: bannerHeight }}>
        <HeaderGameImage
          appid={gameItem.appid}
          compact={!isTablet}
          contained
          height={bannerHeight}
          scrollable
        />
        <BackButton
          onPress={() => navigation.goBack()}
          testID="game-back"
          style={{ top: Math.max(insets.top, 8), left: 12 }}
        />
      </Box>

      {/* 2-Column Split starting strictly below the banner */}
      <Box className="flex-1 flex-row">
        {/* Left Column (~40% width - Master Overview) */}
        <Box
          className="h-full border-r border-outline-100 bg-background-0"
          style={{ width: '40%' }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
          >
            <GameIdentity
              className="bg-background-0"
              title={gameItem.name}
              chips={
                <GameStatusChips
                  livePlayers={livePlayers}
                  streakText={streakText}
                  appId={String(gameItem.appid)}
                  status={gameStatus}
                  onStatusChange={refetchGameStatus}
                />
              }
            />

            <Box className="pt-3 px-4">
              <VStack space="xl">
                <GameStatBand stats={stats} isLandscape={isLandscape && !isTablet} />

                <AchievementsSummary
                  unlockedCount={unlockedCount}
                  totalCount={totalCount}
                  completionPercent={completionPercent}
                  onPress={() => setShowInlineAchievements(true)}
                />
              </VStack>
            </Box>
          </ScrollView>
        </Box>

        {/* Right Column (~60% width - Interactive Detail Pane) */}
        <Box className="flex-1 h-full bg-background-0 pt-3 px-4" style={{ width: '60%' }}>
          {showInlineAchievements ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={true}
            >
              <InlineAchievementsDetail
                gameID={gameItem.appid}
                playerID={playerID}
                globalAchievements={globalAchievements}
                onBack={() => setShowInlineAchievements(false)}
              />
            </ScrollView>
          ) : (
            <GameSectionTabs
              appid={gameItem.appid}
              stickyHeader
              screenshotsSlot={
                <GameScreenshotsGrid
                  screenshots={screenshots}
                  totalCount={totalScreenshots}
                  isLoading={isLoadingScreenshots}
                  isLoadingMore={isLoadingMoreScreenshots}
                />
              }
              achievementsSlot={
                <GlobalAchievementsPreview
                  gameID={gameItem.appid}
                  playerID={playerID}
                  gameItem={gameItem}
                  onSeeAll={() => setShowInlineAchievements(true)}
                />
              }
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default GameView;
