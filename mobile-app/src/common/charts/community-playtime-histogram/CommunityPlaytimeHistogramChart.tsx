import { useState, memo } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Icon, ChevronLeftIcon, ChevronRightIcon } from '@gamelog/common/gluestack/icon';
import { WarningBox } from '@gamelog/common/feedbacks';
import { GLSegmentedControl, GLSegmentOption } from '@gamelog/common/GLSegmentedControl';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import { BarChart } from 'react-native-gifted-charts';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { brand, tailwindColors } from '@gamelog/theme/theme';
import { ChartAxisText, ChartDateRangeText } from '@gamelog/common/typography/ChartTypography';
import { formatShortDate, formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useCommunityPlaytime, CommunityPeriodRange } from './useCommunityPlaytime';
import { useCommunityPlaytimeHistogramData } from './useCommunityPlaytimeHistogramData';
import type { CommunityScope } from '@gamelog/api-manager/dto';

const MemoizedBarChart = memo(BarChart);

const RANGE_OPTIONS: GLSegmentOption<CommunityPeriodRange>[] = [
  { id: 'week', label: 'Week', testID: 'community-histogram-range-week' },
  { id: 'month', label: 'Months', testID: 'community-histogram-range-month' },
];

interface CommunityPlaytimeHistogramChartProps {
  scope?: CommunityScope;
}

const CommunityPlaytimeHistogramChart = ({ scope = 'global' }: CommunityPlaytimeHistogramChartProps) => {
  const [periodRange, setPeriodRange] = useState<CommunityPeriodRange>('week');
  const [offset, setOffset] = useState<number>(0);

  const { isLandscape } = useOrientation();
  const barWidth = isLandscape ? 16 : 12;
  const barChartHeight = isLandscape ? 200 : 140;
  const containerHeight = isLandscape ? 240 : 180;

  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  const axisColor = parseRGB(theme['--color-typography-200']);
  const primaryColor = parseRGB(brand.primary['500']);
  const purpleColor = parseRGB(tailwindColors.purple['500']);

  const {
    data,
    isLoading,
    error,
    errorMessage,
    dateRangeInfo,
  } = useCommunityPlaytime({
    scope,
    periodRange,
    offset,
  });

  const {
    userTotalLabel,
    communityTotalLabel,
    maxVisibleHours,
    minVisibleHours,
    hasPlaytime,
    barData,
    chartMaxValue,
  } = useCommunityPlaytimeHistogramData({
    data,
    periodRange,
    labels: dateRangeInfo.labels,
    offset,
    axisColor,
    primaryColor,
    purpleColor,
    theme,
    barWidth,
  });

  const renderError = () => (
    <Box className="py-6 items-center justify-center w-full">
      <WarningBox
        message={errorMessage || 'Unable to load community playtime history.'}
        className="w-full"
      />
    </Box>
  );

  return (
    <ChartWrapperCard
      label="Community Playtime"
      headerRight={
        <Box className="w-[140px] ml-auto">
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
      testID="community-playtime-histogram-chart"
    >
      {({ cardWidth }) => {
        const startTimestamp = dateRangeInfo.startTimestamp;
        const endTimestamp = dateRangeInfo.endTimestamp;

        const availableWidth = (cardWidth || 350) - 10;
        const maxDrawingWidth = availableWidth - 44;
        const groupCount = dateRangeInfo.labels.length || (periodRange === 'week' ? 7 : 6);
        const pairWidth = 2 * barWidth + 2;
        const totalPairsWidth = groupCount * pairWidth;
        const remainingWidth = Math.max(4, maxDrawingWidth - totalPairsWidth);
        const groupSpacing = Math.max(4, Math.floor(remainingWidth / groupCount));
        const exactDrawingWidth = totalPairsWidth + groupSpacing * groupCount;
        const exactTotalWidth = exactDrawingWidth + 44;

        const finalBarData = barData.map((item, idx) => {
          if (idx % 2 === 1) {
            return { ...item, spacing: groupSpacing };
          }
          return item;
        });

        return (
          <VStack space="sm" className="w-full">
            <VStack space="xs" className="w-full mt-1">
              {/* Header with dual playtimes and date range navigation */}
              <VStack className="w-full px-4 mb-4" space="xs">
                <HStack className="w-full justify-between items-center flex-wrap">
                  <HStack space="md" className="items-center">
                    {/* User Playtime (Blue) */}
                    <HStack space="xs" className="items-center">
                      <Box
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: `rgb(${brand.primary['500']})` }}
                      />
                      <Text size="sm" className="font-bold text-primary-500">
                        You: {userTotalLabel}
                      </Text>
                    </HStack>

                    {/* Community Playtime (Purple) */}
                    <HStack space="xs" className="items-center">
                      <Box
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: `rgb(${tailwindColors.purple['500']})` }}
                      />
                      <Text size="sm" className="font-bold text-purple-500">
                        Others: {communityTotalLabel}
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Navigation Chevrons */}
                  <HStack space="xs" className="items-center">
                    <Pressable
                      onPress={() => setOffset((prev) => prev - 1)}
                      className="w-9 h-9 items-center justify-center rounded-full active:bg-background-100"
                      accessibilityLabel="Previous period"
                      testID="community-histogram-prev"
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
                      className="w-9 h-9 items-center justify-center rounded-full active:bg-background-100"
                      accessibilityLabel="Next period"
                      testID="community-histogram-next"
                    >
                      <Icon as={ChevronRightIcon} className="text-typography-500" />
                    </Pressable>
                  </HStack>
                </HStack>
              </VStack>

              {/* Chart Container */}
              <Box
                style={{
                  overflow: 'hidden',
                  width: exactTotalWidth,
                  height: containerHeight,
                  position: 'relative',
                  alignItems: 'center',
                }}
              >
                {!hasPlaytime && (
                  <Box
                    className="absolute inset-0 z-10 justify-center items-center"
                    style={{ top: -20 }}
                  >
                    <Text className="text-typography-400 font-medium">
                      No playtime for the selected {periodRange === 'week' ? 'week' : 'period'}
                    </Text>
                  </Box>
                )}

                {/* Left Y-axis labels */}
                <Box
                  className="absolute left-1 w-11 z-10 pointer-events-none"
                  style={{ top: -4, bottom: 22 }}
                >
                  {maxVisibleHours > 0 && (
                    <ChartAxisText
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        color: parseRGB(theme['--color-typography-400']),
                      }}
                    >
                      {formatMinutesToHoursShort(Math.round(maxVisibleHours * 60)) || '0h'}
                    </ChartAxisText>
                  )}

                  {minVisibleHours > 0 && maxVisibleHours > 0 && (
                    <ChartAxisText
                      style={{
                        position: 'absolute',
                        bottom: `${(minVisibleHours / chartMaxValue) * 100}%`,
                        right: 0,
                        transform: [{ translateY: 5 }],
                        color: parseRGB(theme['--color-typography-400']),
                      }}
                    >
                      {formatMinutesToHoursShort(Math.round(minVisibleHours * 60))}
                    </ChartAxisText>
                  )}

                  <ChartAxisText
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      color: parseRGB(theme['--color-typography-400']),
                    }}
                  >
                    0h
                  </ChartAxisText>
                </Box>

                <MemoizedBarChart
                  key={`${periodRange}-${offset}-${scope}`}
                  data={finalBarData}
                  width={exactTotalWidth}
                  spacing={groupSpacing}
                  initialSpacing={groupSpacing / 2}
                  maxValue={chartMaxValue}
                  barWidth={barWidth}
                  height={barChartHeight}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  noOfSections={1}
                  hideYAxisText
                  yAxisLabelWidth={44}
                  showFractionalValues={false}
                  xAxisColor={axisColor}
                  disableScroll
                  dashWidth={0}
                  scrollAnimation={false}
                />
              </Box>

              <Text size="xs" className="text-typography-300 text-center mt-2">
                Comparing your hours with {scope === 'global' ? 'the global community' : scope === 'region' ? 'your region' : 'your friends'}.
              </Text>
            </VStack>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default CommunityPlaytimeHistogramChart;
