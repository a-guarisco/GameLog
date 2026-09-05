import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { useState, memo, useRef, useEffect } from 'react';
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
import {
  ChartAxisText,
  ChartDateRangeText,
  ChartSummaryText,
} from '@gamelog/common/typography/ChartTypography';
import { formatShortDate, formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useCommunityPlaytime, CommunityPeriodRange } from './useCommunityPlaytime';
import { useCommunityPlaytimeHistogramData } from './useCommunityPlaytimeHistogramData';
import type { CommunityScope } from '@gamelog/api-manager/dto';

const MemoizedBarChart = memo(BarChart);

const PORTRAIT_RANGE_OPTIONS: GLSegmentOption<CommunityPeriodRange>[] = [
  { id: 'week', label: '1W', testID: 'community-histogram-range-week' },
  { id: 'month', label: '6M', testID: 'community-histogram-range-month' },
];

const LANDSCAPE_RANGE_OPTIONS: GLSegmentOption<CommunityPeriodRange>[] = [
  { id: 'twoWeeks', label: '2W', testID: 'community-histogram-range-two-weeks' },
  { id: 'month', label: '6M', testID: 'community-histogram-range-month' },
  { id: 'year', label: '1Y', testID: 'community-histogram-range-year' },
];

interface CommunityPlaytimeHistogramChartProps {
  scope?: CommunityScope;
  targetUserId?: string;
  targetUserName?: string;
  chartTitle?: string;
}

const CommunityPlaytimeHistogramChart = ({
  scope = 'global',
  targetUserId,
  targetUserName,
  chartTitle,
}: CommunityPlaytimeHistogramChartProps) => {
  const { isLandscape } = useOrientation();
  const hasUserSelectedRange = useRef(false);
  const prevIsLandscapeRef = useRef(isLandscape);

  const [periodRange, setPeriodRange] = useState<CommunityPeriodRange>(() =>
    isLandscape ? 'twoWeeks' : 'week'
  );
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    if (prevIsLandscapeRef.current !== isLandscape) {
      prevIsLandscapeRef.current = isLandscape;
      if (!hasUserSelectedRange.current) {
        setPeriodRange(isLandscape ? 'twoWeeks' : 'week');
        setOffset(0);
      } else if (!isLandscape) {
        if (periodRange === 'twoWeeks') {
          setPeriodRange('week');
          setOffset(0);
        } else if (periodRange === 'year') {
          setPeriodRange('month');
          setOffset(0);
        }
      } else if (isLandscape) {
        if (periodRange === 'week') {
          setPeriodRange('twoWeeks');
          setOffset(0);
        }
      }
    }
  }, [isLandscape, periodRange]);

  const barWidth = isLandscape
    ? periodRange === 'year' || periodRange === 'twoWeeks'
      ? 14
      : periodRange === 'month'
        ? 20
        : 18
    : 12;
  const barChartHeight = isLandscape ? 200 : 140;
  const containerHeight = isLandscape ? 240 : 180;

  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  const axisColor = parseRGB(theme['--color-typography-200']);
  const primaryColor = HEX_COLORS.comparison.user.hex;
  const compareColor = HEX_COLORS.comparison.compare.hex;

  const { data, isLoading, error, errorMessage, dateRangeInfo } = useCommunityPlaytime({
    scope,
    periodRange,
    offset,
    targetUserId,
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
    compareColor,
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

  const displayTitle =
    chartTitle || (targetUserName ? `${targetUserName}'s Playtime` : 'Community Playtime');
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
        <Box className={`${isLandscape ? 'w-[150px]' : 'w-[100px]'} ml-auto`}>
          <GLSegmentedControl<CommunityPeriodRange>
            options={isLandscape ? LANDSCAPE_RANGE_OPTIONS : PORTRAIT_RANGE_OPTIONS}
            activeId={periodRange}
            onSelect={(id) => {
              hasUserSelectedRange.current = true;
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
        const groupCount =
          dateRangeInfo.labels.length ||
          (periodRange === 'week'
            ? 7
            : periodRange === 'twoWeeks'
              ? 14
              : periodRange === 'year'
                ? 12
                : 6);
        const pairWidth = 2 * barWidth + 2;
        const totalPairsWidth = groupCount * pairWidth;
        const remainingWidth = Math.max(4, maxDrawingWidth - totalPairsWidth);

        const minSpacing = isLandscape
          ? periodRange === 'twoWeeks' || periodRange === 'year'
            ? 12
            : periodRange === 'month'
              ? 32
              : 26
          : 4;
        const dynamicSpacing = Math.floor(remainingWidth / (groupCount + 0.5));
        const groupSpacing = Math.max(minSpacing, dynamicSpacing);
        const initialSpacing = Math.max(2, Math.floor(groupSpacing / 2));
        const exactDrawingWidth = totalPairsWidth + groupSpacing * groupCount + initialSpacing;
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
              {/* Header with dual playtime numbers on left and date navigation on right */}
              <VStack className="w-full px-0 mb-3" space="xs">
                <HStack className="w-full justify-between items-center flex-wrap">
                  {/* Left: Summary totals in blue and compareColor with separator */}
                  <HStack space="xs" className="items-baseline">
                    <ChartSummaryText className="text-primary-500">
                      {userTotalLabel}
                    </ChartSummaryText>
                    <Text size="lg" className="text-typography-400 font-bold">
                      {' '}
                      ·{' '}
                    </Text>
                    <ChartSummaryText className="text-comparison-compare-500">
                      {communityTotalLabel}
                    </ChartSummaryText>
                  </HStack>

                  {/* Right: Date navigation positioned below the range selector */}
                  <HStack space="xs" className="items-center -mr-1">
                    <Pressable
                      onPress={() => setOffset((prev) => prev - 1)}
                      className="w-7 h-7 items-center justify-center rounded-full active:bg-background-100"
                      accessibilityLabel="Previous period"
                      testID="community-histogram-prev"
                    >
                      <Icon as={ChevronLeftIcon} className="text-typography-500" />
                    </Pressable>

                    <ChartDateRangeText>
                      {periodRange === 'year'
                        ? `${new Date(startTimestamp * 1000).getFullYear()}`
                        : `${formatShortDate(startTimestamp)} - ${formatShortDate(endTimestamp)}`}
                    </ChartDateRangeText>

                    <Pressable
                      onPress={() => setOffset((prev) => Math.min(0, prev + 1))}
                      disabled={offset >= 0}
                      style={{ opacity: offset >= 0 ? 0.3 : 1 }}
                      className="w-7 h-7 items-center justify-center rounded-full active:bg-background-100"
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
                      No playtime for the selected{' '}
                      {periodRange === 'week'
                        ? 'week'
                        : periodRange === 'twoWeeks'
                          ? '2-week period'
                          : periodRange === 'year'
                            ? 'year'
                            : 'period'}
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
                  key={`${periodRange}-${offset}-${scope}-${isLandscape}`}
                  data={finalBarData}
                  width={exactTotalWidth}
                  spacing={groupSpacing}
                  initialSpacing={initialSpacing}
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
                  roundedTop
                  roundedBottom
                  topRadius={4}
                  bottomRadius={4}
                />
              </Box>

              {/* Caption / Legend colored as in communityGenreRadar */}
              <HStack space="lg" className="items-center justify-center pt-2 pb-1">
                <HStack space="xs" className="items-center">
                  <Box
                    className="w-2.5 h-2.5 rounded-full"
                    className="bg-comparison-user-500"
                  />
                  <Text size="xs" className="font-bold text-primary-500">
                    You
                  </Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <Box
                    className="w-2.5 h-2.5 rounded-full"
                    className="bg-comparison-compare-500"
                  />
                  <Text size="xs" className="font-bold text-comparison-compare-500">
                    {othersLabel}
                  </Text>
                </HStack>
              </HStack>

              <Text size="xs" className="text-typography-300 text-center">
                Comparing your hours with {comparisonScopeText}.
              </Text>
            </VStack>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default CommunityPlaytimeHistogramChart;
