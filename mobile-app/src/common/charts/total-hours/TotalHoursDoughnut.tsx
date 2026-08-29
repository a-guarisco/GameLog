import { memo, useRef, useEffect, useCallback } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { computePieRadius, computePieInnerRadius, parseRGB } from '../chartsHelpers';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';
import { useTotalHoursDoughnut } from './useTotalHoursDoughnut';
import { Animated, Easing } from 'react-native';
import { useOrientation } from '@gamelog/common/useOrientation';

import type { OwnedGames } from '@gamelog/api-manager/dto';

interface TotalHoursDoughnutProps {
  ownedGames?: OwnedGames | null;
}

const GAME_TO_REPRESENT = 5;

// Memoized Center Label to prevent re-renders breaking the animation
const CenterLabel = memo(({ pieData, theme, legendWidth, legendHeight }: any) => (
  <Box
    style={{
      width: legendWidth,
      height: legendHeight,
      alignItems: 'flex-start',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    {pieData.map((item: any) => (
      <Box
        key={item.label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 2,
        }}
      >
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: item.color,
            flexShrink: 0,
          }}
        />
        <Text
          style={{
            color: `rgb(${theme['--color-typography-200']})`,
            fontSize: 11,
            fontWeight: '600',
          }}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </Box>
    ))}
  </Box>
));
CenterLabel.displayName = 'CenterLabel';

// Memoized Tooltip
const Tooltip = memo(({ item, theme, totalMinutes }: any) => {
  const value = parseInt(item.value.toString());
  const percent = Math.round((value / totalMinutes) * 100);
  const formatted = `${formatMinutesToHours(value)} · ${percent}%`;

  return (
    <Box
      style={{
        backgroundColor: `rgb(${theme['--color-background-50']})`,
        padding: 6,
        borderRadius: 6,
        maxWidth: 100,
        borderWidth: 1,
        borderColor: `rgb(${theme['--color-outline-100']})`,
      }}
    >
      <Text
        style={{
          color: `rgb(${theme['--color-typography-0']})`,
          fontSize: 12,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {item.label}
      </Text>
      <Text
        style={{
          color: `rgb(${theme['--color-typography-200']})`,
          fontSize: 10,
          textAlign: 'center',
        }}
      >
        {formatted}
      </Text>
    </Box>
  );
});
Tooltip.displayName = 'Tooltip';

// Memoized Chart Wrapper to completely isolate the PieChart
const AnimatedPieChart = memo(({ pieData, theme, cardWidth, totalMinutes, isLandscape }: any) => {
  const radius = computePieRadius(cardWidth, isLandscape);
  const innerRadius = computePieInnerRadius(radius);
  const legendHeight = Math.floor(innerRadius * Math.SQRT2);
  const legendWidth = legendHeight - 20;

  // Custom entrance animation to bypass gifted-charts bugs
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run the scale and fade animations in parallel
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.back(1.2)), // Slight overshoot for a soft elastic pop
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  const renderTooltip = useCallback(
    (index: number) => <Tooltip item={pieData[index]} theme={theme} totalMinutes={totalMinutes} />,
    [pieData, theme, totalMinutes]
  );

  const renderCenter = useCallback(
    () => (
      <CenterLabel
        pieData={pieData}
        theme={theme}
        legendWidth={legendWidth}
        legendHeight={legendHeight}
      />
    ),
    [pieData, theme, legendWidth, legendHeight]
  );

  return (
    <Animated.View
      style={{ opacity, transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}
    >
      <PieChart
        data={pieData}
        donut
        showGradient
        showTooltip
        tooltipComponent={renderTooltip}
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor={parseRGB(theme['--color-background-50'])}
        centerLabelComponent={renderCenter}
        showValuesAsLabels={false}
        showTextBackground={false}
      />
    </Animated.View>
  );
});
AnimatedPieChart.displayName = 'AnimatedPieChart';

const TotalHoursDoughnut = ({ ownedGames }: TotalHoursDoughnutProps) => {
  const { pieData, totalMinutes } = useTotalHoursDoughnut(ownedGames, GAME_TO_REPRESENT);
  const { isLandscape } = useOrientation();

  return (
    <ChartWrapperCard
      label="Top 5 Doughnut"
      isLoading={false}
      error={false}
      testID="total-hours-pie-chart"
    >
      {({ cardWidth, theme }) => {
        if (pieData.length === 0) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400">No games found</Text>
            </Box>
          );
        }

        return (
          <AnimatedPieChart
            pieData={pieData}
            theme={theme}
            cardWidth={cardWidth}
            totalMinutes={totalMinutes}
            isLandscape={isLandscape}
          />
        );
      }}
    </ChartWrapperCard>
  );
};

export default TotalHoursDoughnut;
