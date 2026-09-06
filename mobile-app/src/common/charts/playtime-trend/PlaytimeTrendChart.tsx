import { useState, useEffect, useRef } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Pressable, View } from 'react-native';
import { useOrientation } from '@gamelog/common/useOrientation';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import { selectPlaytimeTrend } from './selectPlaytimeTrend';
import { LineChart } from 'react-native-gifted-charts';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

import { formatShortDate } from '@gamelog/utils/formatUtils';
import { GLSegmentedControl } from '@gamelog/common/GLSegmentedControl';
import { PointerLabelUpdater } from '@gamelog/common/charts/PointerLabelUpdater';
import { PlaytimeTrendAvgHeader } from './PlaytimeTrendAvgHeader';
import { PlaytimeTrendTotHeader } from './PlaytimeTrendTotHeader';

import { usePlaytimeTrendChart } from './usePlaytimeTrendChart';

import type { PlaytimeByUser } from '@gamelog/api-manager/dto';

const RANGE_OPTIONS = [
  { id: 14, label: '14D' },
  { id: 30, label: '30D' },
  { id: 90, label: '3M' },
  { id: 180, label: '6M' },
  { id: 365, label: '1Y' },
  { id: 1825, label: '5Y' },
  { id: 99999, label: 'ALL' },
];

interface PlaytimeTrendChartProps {
  playtimeByUser?: PlaytimeByUser | null;
}

const PlaytimeTrendChart = ({ playtimeByUser }: PlaytimeTrendChartProps) => {
  const { isLandscape } = useOrientation();
  const hasUserSelectedRange = useRef(false);

  const [trendRange, setTrendRange] = useState<number>(() => (isLandscape ? 30 : 14));
  const [trendMode, setTrendMode] = useState<'avg' | 'tot'>('avg');
  const [activePoint, setActivePoint] = useState<any>(null);

  useEffect(() => {
    if (!hasUserSelectedRange.current) {
      if (isLandscape) {
        if (trendMode === 'avg') {
          const trend30 = selectPlaytimeTrend(playtimeByUser, 30);
          if (trend30.previousTotalMinutes > 0) {
            setTrendRange(30);
          }
        } else {
          setTrendRange(30);
        }
      } else {
        setTrendRange(14);
      }
    }
  }, [isLandscape, trendMode, playtimeByUser]);

  const chartHeight = isLandscape ? 220 : 140;
  const chartContainerHeight = isLandscape ? 240 : 160;

  const {
    trend,
    lineData: trendLineData,
    chartBounds,
    finalPoint,
    finalAverageFormatted,
    cumulativeDeltaInfo,
    baselineAverageFormatted,
  } = usePlaytimeTrendChart(playtimeByUser, trendRange, trendMode, isLandscape);

  let prevDateRangeStr = '';
  if (trend.days && trend.days.length > 0 && trendRange < 99999) {
    const firstDate = new Date(trend.days[0].date);
    const lastDate = new Date(trend.days[trend.days.length - 1].date);
    const prevFirstDate = new Date(firstDate.getTime() - trendRange * 24 * 60 * 60 * 1000);
    const prevLastDate = new Date(lastDate.getTime() - trendRange * 24 * 60 * 60 * 1000);
    prevDateRangeStr = ` (${formatShortDate(prevFirstDate.getTime() / 1000)} - ${formatShortDate(prevLastDate.getTime() / 1000)})`;
  }

  return (
    <ChartWrapperCard
      label={`Playtime Trend`}
      headerRight={
        <Box className="w-[120px]">
          <GLSegmentedControl
            options={[
              { id: 'avg', label: 'AVG' },
              { id: 'tot', label: 'TOT' },
            ]}
            activeId={trendMode}
            onSelect={(id) => {
              const newMode = id as 'avg' | 'tot';
              setTrendMode(newMode);
              if (newMode === 'avg') {
                const currentTrend = selectPlaytimeTrend(playtimeByUser, trendRange);
                if (currentTrend.previousTotalMinutes <= 0) {
                  let closestValidId = 14;
                  let minDiff = Infinity;
                  for (const opt of RANGE_OPTIONS) {
                    const optTrend = selectPlaytimeTrend(playtimeByUser, opt.id);
                    if (optTrend.previousTotalMinutes > 0) {
                      const diff = Math.abs(opt.id - trendRange);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closestValidId = opt.id;
                      }
                    }
                  }
                  if (minDiff !== Infinity) {
                    setTrendRange(closestValidId);
                  }
                }
              }
            }}
            isOnCard
          />
        </Box>
      }
      isLoading={false}
      error={false}
      testID="profile-playtime-trend"
      ErrorBehaviour={() => (
        <Box className="py-8 items-center justify-center w-full">
          <Text className="text-typography-400">Could not load playtime history</Text>
        </Box>
      )}
    >
      {({ cardWidth, theme }) => {
        if (!trend.hasPlaytime) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400">No playtime in this window</Text>
            </Box>
          );
        }

        const primaryColor = parseRGB(theme['--color-primary-400']);
        return (
          <VStack space="sm" className="w-full">
            <VStack space="xs" className="w-full mt-1">
              {trendMode === 'avg' ? (
                <PlaytimeTrendAvgHeader
                  activePoint={activePoint}
                  finalPoint={finalPoint}
                  trend={trend}
                  finalAverageFormatted={finalAverageFormatted}
                  baselineAverageFormatted={baselineAverageFormatted}
                  prevDateRangeStr={prevDateRangeStr}
                />
              ) : (
                <PlaytimeTrendTotHeader
                  activePoint={activePoint}
                  trend={trend}
                  cumulativeDeltaInfo={cumulativeDeltaInfo}
                  prevDateRangeStr={prevDateRangeStr}
                />
              )}

              <Box
                style={{
                  overflow: 'hidden',
                  width: '100%',
                  alignItems: 'center',
                  marginLeft: -10,
                  height: chartContainerHeight,
                }}
              >
                <LineChart
                  parentWidth={cardWidth || (isLandscape ? 750 : 370)}
                  adjustToWidth
                  disableScroll
                  initialSpacing={0}
                  endSpacing={0}
                  data={trendLineData}
                  height={chartHeight}
                  yAxisOffset={Math.max(
                    0,
                    chartBounds.min - (chartBounds.max - chartBounds.min) * 0.1
                  )}
                  maxValue={(chartBounds.max - chartBounds.min) * 1.2 || 10}
                  isAnimated
                  animationDuration={600}
                  color={primaryColor}
                  thickness={isLandscape ? 4 : 3}
                  hideDataPoints
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  hideYAxisText
                  pointerConfig={{
                    pointerStripHeight: chartHeight,
                    pointerStripColor: primaryColor,
                    pointerStripWidth: 2,
                    pointerColor: primaryColor,
                    radius: 5,
                    pointerLabelWidth: 0,
                    pointerLabelHeight: 0,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: false,
                    pointerLabelComponent: (items: any) => {
                      const item = items[0];
                      if (!item) return <View />;
                      return <PointerLabelUpdater item={item} onUpdate={setActivePoint} />;
                    },
                  }}
                />
              </Box>

              <HStack space="xs" className="w-full flex-wrap justify-between mt-1 mb-1">
                {RANGE_OPTIONS.map((opt) => {
                  let isDisabled = false;
                  if (trendMode === 'avg') {
                    const optTrend = selectPlaytimeTrend(playtimeByUser, opt.id);
                    if (optTrend.previousTotalMinutes <= 0) {
                      isDisabled = true;
                    }
                  }
                  const isSelected = trendRange === opt.id;

                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        if (!isDisabled) {
                          hasUserSelectedRange.current = true;
                          setTrendRange(opt.id);
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-2 py-1 rounded-full ${
                        isSelected
                          ? 'bg-primary-500'
                          : isDisabled
                            ? 'bg-transparent opacity-40'
                            : 'bg-background-50'
                      }`}
                    >
                      <Text
                        size="xs"
                        className={
                          isSelected ? 'text-typography-0 font-bold' : 'text-typography-300'
                        }
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>

              <Text size="xs" className="text-typography-300 text-center mt-2">
                Long press on the chart to see trends.
              </Text>
            </VStack>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default PlaytimeTrendChart;
