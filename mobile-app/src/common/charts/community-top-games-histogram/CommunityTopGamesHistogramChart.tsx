import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { useState, useRef, useEffect } from 'react';
import { Pressable, Image, Animated, Easing } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Icon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@gamelog/common/gluestack/icon';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import { WarningBox } from '@gamelog/common/feedbacks';
import { GLSegmentedControl, GLSegmentOption } from '@gamelog/common/GLSegmentedControl';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import { ChartDateRangeText } from '@gamelog/common/typography/ChartTypography';
import { formatShortDate } from '@gamelog/utils/formatUtils';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { useOrientation } from '@gamelog/common/useOrientation';
import { ShimmerBox } from '@gamelog/common/charts/playtime-blocks/PlaytimeBlocksHeader';
import { useCommunityTopGames } from './useCommunityTopGames';
import {
  useCommunityTopGamesHistogramData,
  TopGameDisplayItem,
} from './useCommunityTopGamesHistogramData';
import type { CommunityPeriodRange } from '@gamelog/common/charts/community-playtime-histogram/useCommunityPlaytime';
import type { CommunityScope, OwnedGames, TopGameReference } from '@gamelog/api-manager/dto';

const RANGE_OPTIONS: GLSegmentOption<CommunityPeriodRange>[] = [
  { id: 'week', label: '1W', testID: 'community-top-games-range-week' },
  { id: 'month', label: '6M', testID: 'community-top-games-range-month' },
];

interface CommunityTopGamesHistogramChartProps {
  scope?: CommunityScope;
  ownedGames?: OwnedGames | null;
  targetUserId?: string;
  targetUserName?: string;
  chartTitle?: string;
}

const CommunityTopGamesHistogramChart = ({
  scope = 'global',
  ownedGames,
  targetUserId,
  targetUserName,
  chartTitle,
}: CommunityTopGamesHistogramChartProps) => {
  const { isLandscape } = useOrientation();
  const [periodRange, setPeriodRange] = useState<CommunityPeriodRange>('week');
  const [reference, setReference] = useState<TopGameReference>('community');
  const [offset, setOffset] = useState<number>(0);

  const { data, isLoading, error, errorMessage, dateRangeInfo } = useCommunityTopGames({
    scope,
    periodRange,
    reference,
    offset,
    targetUserId,
  });

  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (isLoading) {
      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => {
        loop.stop();
        shimmerAnim.setValue(-1);
      };
    }
  }, [isLoading, shimmerAnim]);

  const { topGamesItems, hasData } = useCommunityTopGamesHistogramData({
    data,
    ownedGames,
  });

  const displayItems = isLandscape ? topGamesItems.slice(0, 10) : topGamesItems.slice(0, 5);

  const renderError = () => (
    <Box className="py-6 items-center justify-center w-full">
      <WarningBox
        message={errorMessage || 'Unable to load top community games.'}
        className="w-full"
      />
    </Box>
  );

  const renderUserBar = (item: TopGameDisplayItem) => (
    <HStack key="user" className="w-full items-center" space="md">
      <Box className="flex-1 flex-row items-center h-1.5">
        <Box
          className="h-1.5 rounded-full bg-comparison-user-500"
          style={{
            width: `${item.userPlaytime > 0 ? Math.max(1, item.userPercent) : 0}%`,
            opacity: item.userPlaytime > 0 ? 1 : 0,
          }}
          testID={`user-bar-${item.id}`}
        />
      </Box>
      <Text size="sm" className="font-bold w-16 text-right text-comparison-user-500">
        {item.userFormatted}
      </Text>
    </HStack>
  );

  const renderCommunityBar = (item: TopGameDisplayItem) => (
    <HStack key="community" className="w-full items-center" space="md">
      <Box className="flex-1 flex-row items-center h-1.5">
        <Box
          className="h-1.5 rounded-full bg-comparison-compare-500"
          style={{
            width: `${item.communityPlaytime > 0 ? Math.max(1, item.communityPercent) : 0}%`,
            opacity: item.communityPlaytime > 0 ? 1 : 0,
          }}
          testID={`community-bar-${item.id}`}
        />
      </Box>
      <Text size="sm" className="font-bold w-16 text-right text-comparison-compare-500">
        {item.communityFormatted}
      </Text>
    </HStack>
  );

  const displayTitle =
    chartTitle || (targetUserName ? `${targetUserName}'s Top Games` : 'Top Community Games');
  const othersLabel = targetUserName || 'Others';
  const comparisonScopeText = targetUserName
    ? targetUserName
    : scope === 'global'
      ? 'the global community'
      : scope === 'region'
        ? 'your region'
        : 'your friends';

  return (
    <ChartWrapperCard
      label={displayTitle}
      headerRight={
        <Box className="w-[100px] ml-auto">
          <GLSegmentedControl<CommunityPeriodRange>
            options={RANGE_OPTIONS}
            activeId={periodRange}
            onSelect={(id) => {
              setPeriodRange(id);
              setOffset(0);
            }}
            isOnCard
          />
        </Box>
      }
      isLoading={false}
      error={false}
      ErrorBehaviour={renderError}
      testID="community-top-games-histogram-chart"
    >
      {() => {
        const startTimestamp = dateRangeInfo.startTimestamp;
        const endTimestamp = dateRangeInfo.endTimestamp;

        return (
          <VStack space="md" className="w-full">
            {/* Header controls row with Reference Filter Buttons on left and Date navigation on right */}
            <VStack className="w-full px-0 mb-1" space="xs">
              <HStack className="w-full justify-between items-center flex-wrap">
                {/* Left: Reference segmented pill ("Others" / "You") with equal button dimensions */}
                <HStack className="w-[130px] items-center rounded-full border border-outline-300 overflow-hidden">
                  <Pressable
                    onPress={() => setReference('user')}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.5 : 1 }}
                    testID="community-top-games-reference-user"
                    className={`flex-1 py-1 flex-row items-center justify-center border-r border-outline-300 ${
                      reference === 'user' ? 'bg-comparison-user-500' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      size="xs"
                      className={
                        reference === 'user'
                          ? 'text-white font-bold'
                          : 'text-typography-300 font-medium'
                      }
                      numberOfLines={1}
                    >
                      You
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setReference('community')}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.5 : 1 }}
                    testID="community-top-games-reference-community"
                    className={`flex-1 py-1 flex-row items-center justify-center ${
                      reference === 'community' ? 'bg-comparison-compare-500' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      size="xs"
                      className={
                        reference === 'community'
                          ? 'text-black font-bold'
                          : 'text-typography-300 font-medium'
                      }
                      numberOfLines={1}
                    >
                      {othersLabel}
                    </Text>
                  </Pressable>
                </HStack>

                {/* Right: Date navigation positioned below the range selector */}
                <HStack space="xs" className="items-center -mr-1">
                  <Pressable
                    onPress={() => setOffset((prev) => prev - 1)}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.3 : 1 }}
                    className="w-7 h-7 items-center justify-center rounded-full active:bg-background-100"
                    accessibilityLabel="Previous period"
                    testID="community-top-games-prev"
                  >
                    <Icon as={ChevronLeftIcon} className="text-typography-500" />
                  </Pressable>

                  {isLoading ? (
                    <ShimmerBox
                      className="w-24 h-5 rounded-md"
                      anim={shimmerAnim}
                      testID="community-top-games-date-shimmer"
                    />
                  ) : (
                    <ChartDateRangeText>
                      {formatShortDate(startTimestamp)} - {formatShortDate(endTimestamp)}
                    </ChartDateRangeText>
                  )}

                  <Pressable
                    onPress={() => setOffset((prev) => Math.min(0, prev + 1))}
                    disabled={isLoading || offset >= 0}
                    style={{ opacity: isLoading || offset >= 0 ? 0.3 : 1 }}
                    className="w-7 h-7 items-center justify-center rounded-full active:bg-background-100"
                    accessibilityLabel="Next period"
                    testID="community-top-games-next"
                  >
                    <Icon as={ChevronRightIcon} className="text-typography-500" />
                  </Pressable>
                </HStack>
              </HStack>
            </VStack>

            {/* Content: Error, Loading Spinner, or List of top games */}
            {error ? (
              <Box
                style={{
                  minHeight: isLandscape ? 240 : 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {renderError()}
              </Box>
            ) : isLoading ? (
              <Box
                style={{
                  minHeight: isLandscape ? 240 : 200,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Spinner testID="spinner" />
              </Box>
            ) : !hasData ? (
              <Box className="py-8 items-center justify-center w-full">
                <Text className="text-typography-400">
                  No top community games found for this period
                </Text>
              </Box>
            ) : isLandscape ? (
              <Box className="flex-row flex-wrap w-full -mx-2">
                {displayItems.map((item) => (
                  <Box key={item.id} className="w-1/2 px-2 mb-4">
                    <HStack
                      space="md"
                      className="items-start w-full"
                      testID={`top-game-item-${item.id}`}
                    >
                      {/* Left: Capsule Image with height matching title + 2 bars */}
                      <Image
                        source={{ uri: steamAssetUrls.getGameCapsuleImage(item.id) }}
                        style={{
                          width: 105,
                          height: 62,
                          borderRadius: 6,
                          backgroundColor: HEX_COLORS.muted.divider.hex,
                        }}
                        resizeMode="cover"
                        testID={`game-capsule-${item.id}`}
                      />

                      {/* Right: Title and Dual Bars */}
                      <VStack className="flex-1" space="xs">
                        <Text size="md" className="font-bold text-typography-0" numberOfLines={1}>
                          {item.name}
                        </Text>

                        {reference === 'user' ? (
                          <>
                            {renderUserBar(item)}
                            {renderCommunityBar(item)}
                          </>
                        ) : (
                          <>
                            {renderCommunityBar(item)}
                            {renderUserBar(item)}
                          </>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </Box>
            ) : (
              <VStack space="md" className="w-full">
                {displayItems.map((item) => (
                  <HStack
                    key={item.id}
                    space="md"
                    className="items-start w-full"
                    testID={`top-game-item-${item.id}`}
                  >
                    {/* Left: Capsule Image with height matching title + 2 bars */}
                    <Image
                      source={{ uri: steamAssetUrls.getGameCapsuleImage(item.id) }}
                      style={{
                        width: 115,
                        height: 68,
                        borderRadius: 6,
                        backgroundColor: HEX_COLORS.muted.divider.hex,
                      }}
                      resizeMode="cover"
                      testID={`game-capsule-${item.id}`}
                    />

                    {/* Right: Title and Dual Bars */}
                    <VStack className="flex-1" space="xs">
                      <Text size="md" className="font-bold text-typography-0" numberOfLines={1}>
                        {item.name}
                      </Text>

                      {reference === 'user' ? (
                        <>
                          {renderUserBar(item)}
                          {renderCommunityBar(item)}
                        </>
                      ) : (
                        <>
                          {renderCommunityBar(item)}
                          {renderUserBar(item)}
                        </>
                      )}
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}

            {!error && (
              <>
                {/* Footer Caption & Legend */}
                <HStack space="lg" className="items-center justify-center pt-2 pb-1">
                  <HStack space="xs" className="items-center">
                    <Box
                      className="w-2.5 h-2.5 rounded-full bg-comparison-user-500"
                    />
                    <Text size="xs" className="font-bold text-primary-500">
                      You
                    </Text>
                  </HStack>
                  <HStack space="xs" className="items-center">
                    <Box
                      className="w-2.5 h-2.5 rounded-full bg-comparison-compare-500"
                    />
                    <Text
                      size="xs"
                      className="font-bold text-comparison-compare-500"
                    >
                      {othersLabel}
                    </Text>
                  </HStack>
                </HStack>

                <Text size="xs" className="text-typography-300 text-center">
                  {reference === 'user'
                    ? targetUserName
                      ? `Comparing your top played games against ${targetUserName}'s averages.`
                      : `Comparing your top played games against ${comparisonScopeText} averages.`
                    : targetUserName
                      ? `Comparing ${targetUserName}'s top played games with your playtime.`
                      : `Comparing community trending titles in ${comparisonScopeText} with your playtime.`}
                </Text>
              </>
            )}
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default CommunityTopGamesHistogramChart;
