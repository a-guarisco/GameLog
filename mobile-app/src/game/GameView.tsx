import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import GameHero from '@gamelog/game/GameHero';
import GameStatBand from '@gamelog/game/GameStatBand';
import GameCapturesStrip, { GameCapture } from '@gamelog/game/GameCapturesStrip';
import GameSectionTabs from '@gamelog/game/GameSectionTabs';
import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import useAchievementsData from '@gamelog/game/useAchievementsData';
import {
  useGetGameCaptures,
  useGetGameStreak,
  useGetGlobalAchievement,
  useGetNumberOfCurrentPlayers,
} from '@gamelog/api-manager/useApi';
import { useStreakText } from '@gamelog/common/useStreakText';
import { formatMinutesToHoursShort, formatShortDate } from '@gamelog/utils/formatUtils';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

/** Steam leaves short_description empty on plenty of screenshots, hence the fallback. */
const toGameCaptures = (files: PublishedFileDetails[]): GameCapture[] =>
  files.map((file) => ({
    id: file.publishedfileid,
    imageUrl: file.image_url,
    caption: file.short_description || file.title || 'Community screenshot',
  }));

const AchievementsSummary = ({
  unlockedCount,
  totalCount,
  completionPercent,
}: {
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
}) => (
  <VStack space="sm">
    <HStack className="items-center justify-between">
      <Text size="sm" className="font-bold text-typography-0">
        Achievements
      </Text>
      <Text size="sm" className="font-bold text-typography-200">
        {unlockedCount} / {totalCount} · {completionPercent}%
      </Text>
    </HStack>
    <Box
      className="h-1.5 w-full overflow-hidden rounded-full bg-background-200"
      accessibilityRole="progressbar"
      accessibilityLabel={`${unlockedCount} of ${totalCount} achievements unlocked`}
      accessibilityValue={{ min: 0, max: 100, now: completionPercent }}
    >
      <Box
        testID="achievements-summary-fill"
        className="h-full rounded-full bg-primary-400"
        style={{ width: `${completionPercent}%` }}
      />
    </Box>
  </VStack>
);

const GameView = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { gameItem } = route.params;
  const playerID = '76561198077919169'; //FIX

  const { gameStreak, isLoadingGameStreak } = useGetGameStreak(gameItem.appid);
  const streakText = useStreakText(gameStreak?.streak, isLoadingGameStreak);

  const { globalAchievements } = useGetGlobalAchievement(gameItem.appid);
  const { unlockedCount, totalCount, completionPercent } = useAchievementsData(
    gameItem.appid,
    playerID,
    globalAchievements
  );

  const { captures, totalCaptures, loadMoreCaptures, isLoadingCaptures, isLoadingMoreCaptures } =
    useGetGameCaptures(gameItem.appid);

  const { currentPlayers } = useGetNumberOfCurrentPlayers(gameItem.appid);
  const livePlayers = currentPlayers?.response?.player_count ?? 0;

  //todo this come from BE
  const stats = [
    { value: formatMinutesToHoursShort(gameItem.playtime_forever), label: 'Total' },
    {
      value: gameItem.playtime_2weeks ? formatMinutesToHoursShort(gameItem.playtime_2weeks) : '—',
      label: '2 weeks',
    },
    { value: formatShortDate(gameItem.rtime_last_played), label: 'Last played' },
  ];

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <GameHero
          appid={gameItem.appid}
          name={gameItem.name}
          livePlayers={livePlayers}
          streakText={streakText}
          onBack={() => navigation.goBack()}
        />

        <VStack space="xl" className="pt-5">
          <Box className="px-4">
            <GameStatBand stats={stats} />
          </Box>

          <Box className="px-4">
            <AchievementsSummary
              unlockedCount={unlockedCount}
              totalCount={totalCount}
              completionPercent={completionPercent}
            />
          </Box>

          <GameCapturesStrip
            captures={toGameCaptures(captures)}
            totalCount={totalCaptures}
            isLoading={isLoadingCaptures}
            isLoadingMore={isLoadingMoreCaptures}
            onEndReached={loadMoreCaptures}
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
      </ScrollView>
    </Box>
  );
};

export default GameView;
