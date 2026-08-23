import React, { useMemo } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { computePieRadius, computePieInnerRadius, parseRGB } from '../chartsHelpers';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import buildTotalHoursPieData from './buildTotalHoursPieData';
import { PieData } from '../charts.type';
interface TotalHoursPieChartProps {
  ownedGames?: any;
  isLoadingOwnedGames?: boolean;
  errorOwnedGames?: any;
}

const GAME_TO_REPRESENT = 5;

// Memoized Center Label to prevent re-renders breaking the animation
const CenterLabel = React.memo(({ pieData, theme, legendWidth, legendHeight }: any) => (
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
            fontSize: 9,
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

// Memoized Tooltip
const Tooltip = React.memo(({ item, theme, totalMinutes }: any) => {
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

import { Animated, Easing } from 'react-native';

// Memoized Chart Wrapper to completely isolate the PieChart
const AnimatedPieChart = React.memo(({ pieData, theme, cardWidth, totalMinutes }: any) => {
  const radius = computePieRadius(cardWidth);
  const innerRadius = computePieInnerRadius(radius);
  const legendHeight = Math.floor(innerRadius * Math.SQRT2);
  const legendWidth = legendHeight - 20;

  // Custom entrance animation to bypass gifted-charts bugs
  const scale = React.useRef(new Animated.Value(0.3)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
  }, []);

  const renderTooltip = React.useCallback(
    (index: number) => <Tooltip item={pieData[index]} theme={theme} totalMinutes={totalMinutes} />,
    [pieData, theme, totalMinutes]
  );

  const renderCenter = React.useCallback(
    () => <CenterLabel pieData={pieData} theme={theme} legendWidth={legendWidth} legendHeight={legendHeight} />,
    [pieData, theme, legendWidth, legendHeight]
  );

  return (
    <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
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

const TotalHoursPieChart = ({
  ownedGames,
  isLoadingOwnedGames = false,
  errorOwnedGames,
}: TotalHoursPieChartProps) => {
  const pieData: PieData[] = useMemo(() => {
    return buildTotalHoursPieData(ownedGames, GAME_TO_REPRESENT);
  }, [ownedGames]);

  const totalMinutes = useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData]);

  return (
    <ChartWrapperCard
      label="Total Hours Pie"
      isLoading={isLoadingOwnedGames}
      error={!!errorOwnedGames}
      testID="total-hours-pie-chart"
    >
      {({ cardWidth, theme }) => (
        <AnimatedPieChart 
          pieData={pieData} 
          theme={theme} 
          cardWidth={cardWidth} 
          totalMinutes={totalMinutes} 
        />
      )}
    </ChartWrapperCard>
  );
};

export default TotalHoursPieChart;
