import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { useColorScheme } from 'react-native';
import { useOrientation } from '@gamelog/common/useOrientation';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import { BarChart } from 'react-native-gifted-charts';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { GLSegmentedControl } from '@gamelog/common/GLSegmentedControl';
import { ChartAxisText } from '@gamelog/common/typography/ChartTypography';
import { formatMinutesToHours, formatMinutesToHoursShort, toIsoDate } from '@gamelog/utils/formatUtils';
import { usePlaytimeBlocksData } from './usePlaytimeBlocksData';
import { useChartScrollShimmer } from './useChartScrollShimmer';
import { PlaytimeBlocksHeader, ShimmerBox } from './PlaytimeBlocksHeader';

import type { PlaytimeByUser } from '@gamelog/api-manager/dto';

const MemoizedBarChart = memo(BarChart);

const PORTRAIT_RANGE_OPTIONS = [
  { id: 'week', label: 'Week' },
  { id: '14', label: '14D' },
];

const LANDSCAPE_RANGE_OPTIONS = [
  { id: 'week', label: 'Week' },
  { id: '14', label: '14D' },
  { id: '30', label: '30D' },
];

interface PlaytimeBlocksChartProps {
  playtimeByUser?: PlaytimeByUser | null;
}

const PlaytimeBlocksChart = ({ playtimeByUser }: PlaytimeBlocksChartProps) => {
  const { isLandscape } = useOrientation();
  const hasManualSelection = useRef(false);

  const hasSufficientDataFor30 = useMemo(() => {
    if (!playtimeByUser || playtimeByUser.length === 0) return false;
    if (playtimeByUser.length >= 15) return true;
    const fourteenDaysAgoIso = toIsoDate(new Date(Date.now() - 14 * 86400000));
    return playtimeByUser.some((d) => d.date < fourteenDaysAgoIso);
  }, [playtimeByUser]);

  const defaultLandscapeRange = hasSufficientDataFor30 ? '30' : '14';

  const [trendRange, setTrendRange] = useState<string>(() =>
    isLandscape ? defaultLandscapeRange : 'week'
  );
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!hasManualSelection.current) {
      if (isLandscape) {
        setTrendRange(defaultLandscapeRange);
      } else {
        setTrendRange('week');
      }
      setWeekOffset(0);
    } else if (!isLandscape && trendRange === '30') {
      // 30 is not available in portrait mode; fallback to 14
      setTrendRange('14');
      setWeekOffset(0);
    }
  }, [isLandscape, defaultLandscapeRange]);

  const { isScrolling, setIsScrolling, shimmerAnim } = useChartScrollShimmer();

  const barWidth = isLandscape
    ? trendRange === '30'
      ? 12
      : trendRange === '14'
        ? 22
        : 26
    : 18;
  const barChartHeight = isLandscape ? 200 : 140;
  const containerHeight = isLandscape ? 240 : 180;

  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;
  const axisColor = parseRGB(theme['--color-typography-200']);
  const primaryColor = parseRGB(theme['--color-primary-500']);

  const {
    baseLimitDate,
    trend,
    summaryDays,
    maxVisiblePlaytime,
    minVisiblePlaytime,
    finalStackData,
  } = usePlaytimeBlocksData(
    playtimeByUser,
    trendRange,
    weekOffset,
    visibleStartIndex,
    axisColor,
    primaryColor,
    theme
  );

  const scrollTimeout = useRef<any>(null);
  const chartScrollRef = useRef<any>(null);
  const isInitialScrollDone = useRef(false);

  useEffect(() => {
    isInitialScrollDone.current = false;
    const t = setTimeout(() => {
      isInitialScrollDone.current = true;
    }, 100);
    return () => clearTimeout(t);
  }, [trendRange]);

  return (
    <ChartWrapperCard
      label={`Playtime Blocks`}
      headerRight={
        <Box className={isLandscape ? "w-[170px] ml-auto" : "w-[120px] ml-auto"}>
          <GLSegmentedControl
            options={isLandscape ? LANDSCAPE_RANGE_OPTIONS : PORTRAIT_RANGE_OPTIONS}
            activeId={trendRange}
            onSelect={(id) => {
              hasManualSelection.current = true;
              setTrendRange(id);
              setWeekOffset(0);
            }}
            isOnCard
          />
        </Box>
      }
      isLoading={false}
      error={false}
      testID="playtime-blocks-chart"
      ErrorBehaviour={() => (
        <Box className="py-8 items-center justify-center w-full">
          <Text className="text-typography-400">Could not load playtime history</Text>
        </Box>
      )}
    >
      {({ cardWidth }) => {
        const availableWidth = (cardWidth || (isLandscape ? 700 : 350)) - 10;
        const maxDrawingWidth = availableWidth - 44;

        const visibleBarsCount = trendRange === '30' ? 30 : trendRange === '14' ? 14 : 7;
        let spacing = Math.max(
          isLandscape && trendRange === '30' ? 3 : 4,
          Math.floor((maxDrawingWidth - barWidth * visibleBarsCount) / visibleBarsCount)
        );

        const exactDrawingWidth = barWidth * visibleBarsCount + spacing * visibleBarsCount;
        const exactTotalWidth = exactDrawingWidth + 44;

        const handleScroll = (event: any) => {
          if (trendRange === 'week') return;
          if (!isInitialScrollDone.current) return;

          setIsScrolling(true);
          const offsetX = event.nativeEvent.contentOffset.x;
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
          scrollTimeout.current = setTimeout(() => {
            const itemWidth = barWidth + spacing;
            const nearestIndex = Math.round(offsetX / itemWidth);
            const targetIndex = Math.min(
              Math.max(0, trend.days.length - visibleBarsCount),
              Math.max(0, nearestIndex)
            );
            const targetOffsetX = targetIndex * itemWidth;

            if (Math.abs(offsetX - targetOffsetX) > 2) {
              chartScrollRef.current?.scrollTo({ x: targetOffsetX, animated: true });
              setTimeout(() => {
                setIsScrolling(false);
              }, 200);
            } else {
              setIsScrolling(false);
            }

            setVisibleStartIndex(targetIndex);
          }, 50);
        };

        const totalVisibleMinutes = summaryDays.reduce((acc, d) => acc + d.minutes, 0);
        const visibleActiveDays = summaryDays.filter((d) => d.minutes > 0).length;

        const summaryStartDate =
          summaryDays.length > 0 ? new Date(summaryDays[0].date).getTime() / 1000 : 0;
        const summaryEndDate =
          summaryDays.length > 0
            ? new Date(summaryDays[summaryDays.length - 1].date).getTime() / 1000
            : 0;

        const displayTotalLabel =
          trendRange === '14' || trendRange === '30'
            ? formatMinutesToHours(totalVisibleMinutes) || '0m'
            : trend.totalLabel;

        const displayActiveDaysLabel =
          trendRange === '30'
            ? `${visibleActiveDays} days of 30`
            : trendRange === '14'
              ? `${visibleActiveDays} days of 14`
              : trend.activeDaysLabel;

        const displayPeakLabel =
          trendRange === '14' || trendRange === '30'
            ? (() => {
                const peakDay = summaryDays.find((d) => d.minutes === maxVisiblePlaytime);
                return peakDay && maxVisiblePlaytime > 0
                  ? `${peakDay.label} ${new Date(peakDay.date).getDate()} · ${formatMinutesToHours(maxVisiblePlaytime)}`
                  : null;
              })()
            : trend.peakLabel;

        const validDays = summaryDays.filter((d: any) => !d.isFuture && !d.isPastLimit).length;
        const avgPerDay = validDays > 0 ? Math.round(totalVisibleMinutes / validDays) : 0;
        const displayAvgLabel = `avg ${formatMinutesToHours(avgPerDay)}`;

        return (
          <VStack space="sm" className="w-full">
            <VStack space="xs" className="w-full mt-1">
              <PlaytimeBlocksHeader
                isScrolling={isScrolling}
                shimmerAnim={shimmerAnim}
                displayTotalLabel={displayTotalLabel}
                displayPeakLabel={displayPeakLabel}
                displayAvgLabel={displayAvgLabel}
                trendRange={trendRange}
                setWeekOffset={setWeekOffset}
                baseLimitDate={baseLimitDate}
                summaryStartDate={summaryStartDate}
                summaryEndDate={summaryEndDate}
                weekOffset={weekOffset}
                trendDays={trend.days}
              />

              <Box
                style={{
                  overflow: 'hidden',
                  width: exactTotalWidth,
                  height: containerHeight,
                  position: 'relative',
                  alignItems: 'center',
                }}
              >
                {!trend.hasPlaytime && (
                  <Box
                    className="absolute inset-0 z-10 justify-center items-center"
                    style={{ top: -20 }}
                  >
                    <Text className="text-typography-400 font-medium">
                      No playtime for the selected {trendRange === 'week' ? 'week' : 'period'}
                    </Text>
                  </Box>
                )}

                <Box
                  className="absolute left-1 w-11 z-10 pointer-events-none"
                  style={{ top: -4, bottom: 22 }}
                >
                  {maxVisiblePlaytime <= 1440 && (
                    <ChartAxisText
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        color: parseRGB(theme['--color-typography-400']),
                      }}
                    >
                      {formatMinutesToHoursShort(maxVisiblePlaytime) || '0m'}
                    </ChartAxisText>
                  )}

                  {minVisiblePlaytime > 0 && minVisiblePlaytime <= 1440 && (
                    <ChartAxisText
                      style={{
                        position: 'absolute',
                        bottom: `${(minVisiblePlaytime / maxVisiblePlaytime) * 100}%`,
                        right: 0,
                        transform: [{ translateY: 5 }],
                        color: parseRGB(theme['--color-typography-400']),
                      }}
                    >
                      {formatMinutesToHoursShort(minVisiblePlaytime)}
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
                    0m
                  </ChartAxisText>
                </Box>

                <MemoizedBarChart
                  key={`${trendRange}-${weekOffset}`}
                  width={exactTotalWidth}
                  spacing={spacing}
                  initialSpacing={spacing / 2}
                  stackData={finalStackData}
                  maxValue={100}
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
                  disableScroll={trendRange === 'week' || (isLandscape && trend.days.length <= visibleBarsCount)}
                  dashWidth={0}
                  scrollToEnd={trendRange === '14' || trendRange === '30'}
                  scrollAnimation={false}
                  onScroll={handleScroll}
                  scrollRef={chartScrollRef}
                  nestedScrollEnabled
                />
              </Box>

              {isScrolling ? (
                <ShimmerBox className="w-32 h-4 rounded mx-auto mt-2" anim={shimmerAnim} />
              ) : (
                <Text size="xs" className="text-typography-300 text-center mt-2">
                  Played {displayActiveDaysLabel}.
                </Text>
              )}
            </VStack>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default PlaytimeBlocksChart;
