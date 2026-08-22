import { useMemo } from 'react';
import { RadarChart } from 'react-native-gifted-charts';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';
import { Box } from '@gamelog/common/gluestack/box';
import { brand } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';
interface GameGenreRadarChartProps {
  genreChartData?: any[];
  isLoadingGenreChart?: boolean;
  errorGenreChart?: any;
}

const GameGenreRadarChart = ({
  genreChartData = [],
  isLoadingGenreChart = false,
  errorGenreChart,
}: GameGenreRadarChartProps) => {
  const values = useMemo(() => genreChartData.map((d) => Number(d.value) || 0), [genreChartData]);
  const labels = useMemo(
    () => genreChartData.map((d) => `${d.label}\n${formatMinutesToHours(Number(d.value) || 0)}`),
    [genreChartData]
  );

  return (
    <ChartWrapperCard label="Time per Genre" isLoading={isLoadingGenreChart} error={errorGenreChart}>
      {({ theme, cardWidth }) => (
        <>
          <Box style={{ marginTop: -25, marginBottom: -15 }}>
            <RadarChart
              radius={75}
              chartSize={cardWidth ? cardWidth - 16 : 320}
              data={values}
              labels={labels}
              maxValue={Math.max(...values, 1)}
              noOfSections={5}
              labelsPositionOffset={Math.max(...values, 1) * 0.1}
              dataLabelsPositionOffset={10}
              gridConfig={{
                stroke: parseRGB(theme['--color-outline-100']),
                strokeWidth: 1,
                fill: 'transparent',
                showGradient: false,
              }}
              asterLinesConfig={{
                stroke: parseRGB(brand.primary['400']),
                strokeWidth: 1,
                strokeDashArray: [0, 0],
              }}
              labelConfig={{
                stroke: parseRGB(theme['--color-typography-200']),
              }}
              polygonConfig={{
                stroke: parseRGB(brand.primary['500']),
                fill: parseRGB(brand.primary['400']),
                strokeWidth: 2,
                opacity: 0.8,
              }}
            />
          </Box>
        </>
      )}
    </ChartWrapperCard>
  );
};

export default GameGenreRadarChart;
