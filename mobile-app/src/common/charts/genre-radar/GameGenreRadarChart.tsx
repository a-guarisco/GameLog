import { ViewStyle } from 'react-native';
import { RadarChart } from 'react-native-gifted-charts';
import ChartWrapperCard from '../ChartWrapperCard';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { brand } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';
import { useGenreRadarChart } from './useGenreRadarChart';
import { useOrientation } from '@gamelog/common/useOrientation';

import type { OwnedGames } from '@gamelog/api-manager/dto';

interface GameGenreRadarChartProps {
  ownedGames?: OwnedGames | null;
  targetHeight?: number;
  style?: ViewStyle;
}

export const MAX_RADAR_SIZE = 400;

const GameGenreRadarChart = ({ ownedGames, targetHeight, style }: GameGenreRadarChartProps) => {
  const { values, labels, isLoadingGenres } = useGenreRadarChart(ownedGames);
  const { isLandscape, height } = useOrientation();
  const radarPadding = isLandscape ? 8 : 16;

  return (
    <ChartWrapperCard
      label="Genre Radar"
      isLoading={isLoadingGenres}
      error={false}
      style={
        targetHeight
          ? { minHeight: targetHeight, height: targetHeight, maxHeight: targetHeight, ...style }
          : style
      }
    >
      {({ theme, cardWidth }) => {
        if (values.length === 0) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400 font-medium text-center">No genres found</Text>
            </Box>
          );
        }

        const targetSize = isLandscape
          ? Math.min(
              Math.round(height * 0.6),
              cardWidth ? cardWidth - radarPadding : 260,
              MAX_RADAR_SIZE
            )
          : Math.min(cardWidth ? cardWidth - radarPadding : 320, MAX_RADAR_SIZE);

        return (
          <Box
            className="items-center justify-center w-full"
            style={{ marginTop: isLandscape ? -5 : -25, marginBottom: 0 }}
          >
            <RadarChart
              chartSize={targetSize}
              data={values}
              labels={labels}
              maxValue={Math.max(...values, 1)}
              noOfSections={5}
              isAnimated
              animationDuration={500}
              labelsPositionOffset={Math.max(...values, 1) * (isLandscape ? 0.05 : 0.08)}
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
                fontSize: isLandscape ? 11 : 12,
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
