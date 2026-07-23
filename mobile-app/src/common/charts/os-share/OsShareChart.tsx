import { useMemo } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { computePieInnerRadius, computePieRadius } from '../chartsHelpers';
import ChartWrapperCard from '../ChartWrapperCard';
import buildOsShareData from './buildOsShareData';

interface OsShareChartProps {
  ownedGames?: any;
  isLoadingOwnedGames?: boolean;
  errorOwnedGames?: any;
}

const OsShareChart = ({
  ownedGames,
  isLoadingOwnedGames = false,
  errorOwnedGames,
}: OsShareChartProps) => {
  const pieData = useMemo(() => {
    if (!ownedGames || !ownedGames.response) return [];
    return buildOsShareData(ownedGames.response.games);
  }, [ownedGames]);

  return (
    <ChartWrapperCard isLoading={isLoadingOwnedGames} error={!!errorOwnedGames}>
      {({ cardWidth, theme }) => (
        <PieChart
          data={pieData}
          donut
          showGradient
          showTooltip
          showValuesAsTooltipText
          sectionAutoFocus
          radius={computePieRadius(cardWidth)}
          innerRadius={computePieInnerRadius(computePieRadius(cardWidth))}
          innerCircleColor={`rgb(${theme['--color-background-100']})`}
          isAnimated
          animationDuration={500}
          showText
          textSize={12}
          textColor={`rgb(${theme['--color-typography-200']})`}
          showValuesAsLabels={false}
          showTextBackground={false}
        />
      )}
    </ChartWrapperCard>
  );
};

export default OsShareChart;
