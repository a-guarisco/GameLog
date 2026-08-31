import { useState, useRef, useEffect, memo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { useColorScheme } from 'react-native';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import { BarChart } from 'react-native-gifted-charts';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { GLSegmentedControl } from '@gamelog/common/GLSegmentedControl';
import { ChartAxisText } from '@gamelog/common/typography/ChartTypography';
import { formatMinutesToHours, formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';
import { usePlaytimeBlocksData } from './usePlaytimeBlocksData';
import { useChartScrollShimmer } from './useChartScrollShimmer';
import { PlaytimeBlocksHeader, ShimmerBox } from './PlaytimeBlocksHeader';

import type { PlaytimeByUser } from '@gamelog/api-manager/dto';

const MemoizedBarChart = memo(BarChart);

const RANGE_OPTIONS = [
  { id: 'week', label: 'Week' },
  { id: '14', label: '14D' },
];

interface PlaytimeBlocksChartProps {
  playtimeByUser?: PlaytimeByUser | null;
}

const PlaytimeBlocksChart = ({ playtimeByUser }: PlaytimeBlocksChartProps) => {
  const [trendRange, setTrendRange] = useState<string>('week');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState<number | null>(null);

  const { isScrolling, setIsScrolling, shimmerAnim } = useChartScrollShimmer();

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

  const scrollTimeout = useRef<NodeJS.Timeout>();
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
        <Box className="w-[120px] ml-auto">
          <GLSegmentedControl
            options={RANGE_OPTIONS}
            activeId={trendRange}
            onSelect={(id) => {
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
        const barWidth = 18;
        const availableWidth = (cardWidth || 350) - 10;
        const maxDrawingWidth = availableWidth - 44;

        let spacing = Math.max(4, Math.floor((maxDrawingWidth - barWidth * 7) / 7));
        if (trendRange === '14') {
          spacing = Math.max(4, Math.floor((maxDrawingWidth - barWidth * 14) / 14));
        }

        const visibleBarsCount = trendRange === '14' ? 14 : 7;
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
              Math.max(0, trend.days.length - 14),
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
          trendRange === '14'
            ? formatMinutesToHours(totalVisibleMinutes) || '0m'
            : trend.totalLabel;

        const displayActiveDaysLabel =
          trendRange === '14' ? `${visibleActiveDays} days of 14` : trend.activeDaysLabel;

        const displayPeakLabel =
          trendRange === '14'
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
                  height: 180,
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
                  height={140}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  noOfSections={1}
                  hideYAxisText
                  yAxisLabelWidth={44}
                  showFractionalValues={false}
                  xAxisColor={axisColor}
                  disableScroll={trendRange === 'week'}
                  dashWidth={0}
                  scrollToEnd={trendRange === '14'}
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
