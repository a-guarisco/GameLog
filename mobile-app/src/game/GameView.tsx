import { Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import GameHero from '@gamelog/game/GameHero';
import GameTitleBlock from '@gamelog/game/GameTitleBlock';
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
import { formatMinutesToHoursShort, formatShortDateWithYear } from '@gamelog/utils/formatUtils';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

/** Steam leaves short_description empty on plenty of screenshots, hence the fallback. */
const toGameCaptures = (files: PublishedFileDetails[]): GameCapture[] =>
  files.map((file) => ({
    id: file.publishedfileid,
    imageUrl: file.image_url,
    caption: file.short_description || file.title || 'Community screenshot',
  }));

/** Tapping the summary opens the full list, same destination as the section's "see all". */
const AchievementsSummary = ({
  unlockedCount,
  totalCount,
  completionPercent,
  onPress,
}: {
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Achievements, ${unlockedCount} of ${totalCount} unlocked, ${completionPercent} percent. View all achievements`}
    accessibilityValue={{ min: 0, max: 100, now: completionPercent }}
    testID="achievements-summary"
    hitSlop={{ top: 8, bottom: 8 }}
  >
    <VStack space="sm">
      <HStack className="items-center justify-between">
        <Text size="sm" className="font-bold text-typography-0">
          Achievements
        </Text>
        <HStack space="xs" className="items-center">
          <Text size="sm" className="font-bold text-typography-200">
            {unlockedCount} / {totalCount} · {completionPercent}%
          </Text>
          <Ionicons name="chevron-forward" size={14} color={toHex(brand.primary['300'])} />
        </HStack>
      </HStack>
      <Box className="h-1.5 w-full overflow-hidden rounded-full bg-background-200">
        <Box
          testID="achievements-summary-fill"
          className="h-full rounded-full bg-primary-400"
          style={{ width: `${completionPercent}%` }}
        />
      </Box>
    </VStack>
  </Pressable>
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

  const openAchievementsList = () =>
    navigation.navigate('AchievementsList', {
      globalAchievements,
      gameID: gameItem.appid,
      playerID,
      gameItem,
    });

  //todo this come from BE
  const stats = [
    { value: formatMinutesToHoursShort(gameItem.playtime_forever), label: 'Total' },
    {
      value: gameItem.playtime_2weeks ? formatMinutesToHoursShort(gameItem.playtime_2weeks) : '—',
      label: '2 weeks',
    },
    { value: formatShortDateWithYear(gameItem.rtime_last_played), label: 'Last played' },
  ];

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <GameHero appid={gameItem.appid} name={gameItem.name} onBack={() => navigation.goBack()} />

        <VStack space="xl">
          <GameTitleBlock name={gameItem.name} livePlayers={livePlayers} streakText={streakText} />

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
