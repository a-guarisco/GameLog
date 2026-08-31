import { useState } from 'react';
import { Pressable, Image } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Icon, ChevronLeftIcon, ChevronRightIcon } from '@gamelog/common/gluestack/icon';
import { WarningBox } from '@gamelog/common/feedbacks';
import { GLSegmentedControl, GLSegmentOption } from '@gamelog/common/GLSegmentedControl';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import { brand, tailwindColors } from '@gamelog/theme/theme';
import { ChartDateRangeText } from '@gamelog/common/typography/ChartTypography';
import { formatShortDate } from '@gamelog/utils/formatUtils';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { useCommunityTopGames } from './useCommunityTopGames';
import { useCommunityTopGamesHistogramData } from './useCommunityTopGamesHistogramData';
import type { CommunityPeriodRange } from '@gamelog/common/charts/community-playtime-histogram/useCommunityPlaytime';
import type { CommunityScope, OwnedGames } from '@gamelog/api-manager/dto';

const RANGE_OPTIONS: GLSegmentOption<CommunityPeriodRange>[] = [
  { id: 'week', label: '1W', testID: 'community-top-games-range-week' },
  { id: 'month', label: '6M', testID: 'community-top-games-range-month' },
];

interface CommunityTopGamesHistogramChartProps {
  scope?: CommunityScope;
  ownedGames?: OwnedGames | null;
}

const CommunityTopGamesHistogramChart = ({
  scope = 'global',
  ownedGames,
}: CommunityTopGamesHistogramChartProps) => {
  const [periodRange, setPeriodRange] = useState<CommunityPeriodRange>('week');
  const [offset, setOffset] = useState<number>(0);

  const { data, isLoading, error, errorMessage, dateRangeInfo } = useCommunityTopGames({
    scope,
    periodRange,
    offset,
  });

  const { topGamesItems, hasData } = useCommunityTopGamesHistogramData({
    data,
    ownedGames,
  });

  const renderError = () => (
    <Box className="py-6 items-center justify-center w-full">
      <WarningBox
        message={errorMessage || 'Unable to load top community games.'}
        className="w-full"
      />
    </Box>
  );

  return (
    <ChartWrapperCard
      label="Top Community Games"
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
      isLoading={isLoading}
      error={error}
      ErrorBehaviour={renderError}
      testID="community-top-games-histogram-chart"
    >
      {() => {
        const startTimestamp = dateRangeInfo.startTimestamp;
        const endTimestamp = dateRangeInfo.endTimestamp;

        return (
          <VStack space="md" className="w-full">
            {/* Centered Date range navigation */}
            <HStack space="xs" className="w-full items-center justify-center -mt-1 mb-1">
              <Pressable
                onPress={() => setOffset((prev) => prev - 1)}
                className="w-7 h-7 items-center justify-center rounded-full active:bg-background-100"
                accessibilityLabel="Previous period"
                testID="community-top-games-prev"
              >
                <Icon as={ChevronLeftIcon} className="text-typography-500" />
              </Pressable>

              <ChartDateRangeText>
                {formatShortDate(startTimestamp)} - {formatShortDate(endTimestamp)}
              </ChartDateRangeText>

              <Pressable
                onPress={() => setOffset((prev) => Math.min(0, prev + 1))}
                disabled={offset >= 0}
                style={{ opacity: offset >= 0 ? 0.3 : 1 }}
                className="w-7 h-7 items-center justify-center rounded-full active:bg-background-100"
                accessibilityLabel="Next period"
                testID="community-top-games-next"
              >
                <Icon as={ChevronRightIcon} className="text-typography-500" />
              </Pressable>
            </HStack>

            {/* Content: List of top games or empty state */}
            {!hasData ? (
              <Box className="py-8 items-center justify-center w-full">
                <Text className="text-typography-400">
                  No top community games found for this period
                </Text>
              </Box>
            ) : (
              <VStack space="md" className="w-full">
                {topGamesItems.map((item) => (
                  <VStack
                    key={item.id}
                    space="xs"
                    className="w-full"
                    testID={`top-game-item-${item.id}`}
                  >
                    {/* Game Header: Capsule Image + Game Title */}
                    <HStack space="sm" className="items-center w-full">
                      <Image
                        source={{ uri: steamAssetUrls.getGameCapsuleImage(item.id) }}
                        className="w-14 h-7 rounded-md bg-background-200 shrink-0"
                        resizeMode="cover"
                        testID={`game-capsule-${item.id}`}
                      />
                      <Text
                        size="sm"
                        className="font-bold uppercase text-typography-0 flex-1"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </HStack>

                    {/* Bars Container */}
                    <VStack space="xs" className="w-full pl-1 pr-1">
                      {/* User Playtime Bar */}
                      <Box className="w-full flex-row items-center">
                        <Box
                          className="h-5 rounded-full bg-primary-500 items-end justify-center px-2"
                          style={{
                            width: `${item.userPlaytime > 0 ? Math.max(18, item.userPercent) : 0}%`,
                            opacity: item.userPlaytime > 0 ? 1 : 0,
                          }}
                          testID={`user-bar-${item.id}`}
                        >
                          {item.userPlaytime > 0 && (
                            <Text
                              className="text-white text-[11px] font-bold"
                              numberOfLines={1}
                            >
                              {item.userFormatted}
                            </Text>
                          )}
                        </Box>
                        {item.userPlaytime === 0 && (
                          <Text className="text-typography-400 text-xs font-semibold pl-1">
                            0m
                          </Text>
                        )}
                      </Box>

                      {/* Community Playtime Bar */}
                      <Box className="w-full flex-row items-center">
                        <Box
                          className="h-5 rounded-full bg-purple-500 items-end justify-center px-2"
                          style={{
                            width: `${item.communityPlaytime > 0 ? Math.max(18, item.communityPercent) : 0}%`,
                            opacity: item.communityPlaytime > 0 ? 1 : 0,
                          }}
                          testID={`community-bar-${item.id}`}
                        >
                          {item.communityPlaytime > 0 && (
                            <Text
                              className="text-white text-[11px] font-bold"
                              numberOfLines={1}
                            >
                              {item.communityFormatted}
                            </Text>
                          )}
                        </Box>
                        {item.communityPlaytime === 0 && (
                          <Text className="text-typography-400 text-xs font-semibold pl-1">
                            0m
                          </Text>
                        )}
                      </Box>
                    </VStack>
                  </VStack>
                ))}
              </VStack>
            )}

            {/* Footer Caption & Legend */}
            <HStack space="lg" className="items-center justify-center pt-2 pb-1">
              <HStack space="xs" className="items-center">
                <Box
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: `rgb(${brand.primary['500']})` }}
                />
                <Text size="xs" className="font-bold text-primary-500">
                  You
                </Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <Box
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: `rgb(${tailwindColors.purple['500']})` }}
                />
                <Text size="xs" className="font-bold text-purple-500">
                  Others
                </Text>
              </HStack>
            </HStack>

            <Text size="xs" className="text-typography-300 text-center">
              Comparing your hours on trending titles with{' '}
              {scope === 'global'
                ? 'the global community'
                : scope === 'region'
                  ? 'your region'
                  : 'your friends'}
              .
            </Text>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default CommunityTopGamesHistogramChart;
