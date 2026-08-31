import { RadarChart } from 'react-native-gifted-charts';
import ChartWrapperCard from '../ChartWrapperCard';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { brand } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';
import { useGenreRadarChart } from './useGenreRadarChart';

import type { OwnedGames } from '@gamelog/api-manager/dto';

interface GameGenreRadarChartProps {
  ownedGames?: OwnedGames | null;
}

const GameGenreRadarChart = ({ ownedGames }: GameGenreRadarChartProps) => {
  const { values, labels, isLoadingGenres } = useGenreRadarChart(ownedGames);

  return (
    <ChartWrapperCard label="Genre Radar" isLoading={isLoadingGenres} error={false}>
      {({ theme, cardWidth }) => {
        if (values.length === 0) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400">No genres found</Text>
            </Box>
          );
        }

        return (
          <Box style={{ marginTop: -25, marginBottom: -0 }}>
            <RadarChart
              chartSize={cardWidth ? cardWidth - 16 : 320}
              data={values}
              labels={labels}
              maxValue={Math.max(...values, 1)}
              noOfSections={5}
              isAnimated
              animationDuration={500}
              labelsPositionOffset={Math.max(...values, 1) * 0.08}
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
                stroke: parseRGB(theme['--color-typography-400']),
              }}
              polygonConfig={{
                stroke: parseRGB(brand.primary['500']),
                fill: parseRGB(brand.primary['400']),
                strokeWidth: 2,
                opacity: 0.8,
              }}
            />
          </Box>
        );
      }}
    </ChartWrapperCard>
  );
};

export default GameGenreRadarChart;
