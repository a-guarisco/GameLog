import { useState } from 'react';
import { RadarChart } from 'react-native-gifted-charts';
import ChartWrapperCard from '../ChartWrapperCard';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionTabs, { SectionTab } from '@gamelog/common/SectionTabs';
import { WarningBox } from '@gamelog/common/feedbacks';
import { brand, tailwindColors } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';
import { useCommunityGenreRadarChart } from './useCommunityGenreRadarChart';
import { useOrientation } from '@gamelog/common/useOrientation';
import type { OwnedGames, CommunityScope } from '@gamelog/api-manager/dto';

interface CommunityGenreRadarChartProps {
  ownedGames?: OwnedGames | null;
}

const SCOPE_TABS: SectionTab<CommunityScope>[] = [
  { id: 'global', label: 'Global' },
  { id: 'region', label: 'Region' },
  { id: 'friends', label: 'Friends' },
];

const CommunityGenreRadarChart = ({ ownedGames }: CommunityGenreRadarChartProps) => {
  const [scope, setScope] = useState<CommunityScope>('global');
  const { isLandscape } = useOrientation();
  const radarPadding = isLandscape ? 8 : 16;

  const {
    dataSet,
    labels,
    maxValue,
    isLoading,
    errorCommunity,
    errorMessageCommunity,
  } = useCommunityGenreRadarChart(ownedGames, scope);

  const renderError = () => (
    <Box className="py-6 items-center justify-center w-full">
      <WarningBox
        message={errorMessageCommunity || 'Unable to load community genre data.'}
        className="w-full"
      />
    </Box>
  );

  return (
    <VStack space="md" className="w-full">
      <SectionTabs
        tabs={SCOPE_TABS}
        activeId={scope}
        onChange={setScope}
        testIDPrefix="community-radar-scope"
      />

      <ChartWrapperCard
        label="Community Comparison"
        isLoading={isLoading}
        error={errorCommunity}
        ErrorBehaviour={renderError}
      >
        {({ theme, cardWidth }) => {
          if (dataSet.length === 0 || labels.length === 0) {
            return (
              <Box className="py-8 items-center justify-center w-full">
                <Text className="text-typography-400">No community genre data found</Text>
              </Box>
            );
          }

          return (
            <VStack className="w-full items-center">
              {/* Legend */}
              <HStack space="lg" className="items-center justify-center pt-1 pb-2">
                <HStack space="xs" className="items-center">
                  <Box
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `rgb(${brand.primary['400']})` }}
                  />
                  <Text size="xs" className="font-semibold text-typography-200">
                    You (%)
                  </Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <Box
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: `rgb(${tailwindColors.orange['400']})` }}
                  />
                  <Text size="xs" className="font-semibold text-typography-200">
                    Community (%)
                  </Text>
                </HStack>
              </HStack>

              <Box style={{ marginTop: -15, marginBottom: 0 }}>
                <RadarChart
                  chartSize={cardWidth ? cardWidth - radarPadding : 320}
                  dataSet={dataSet}
                  labels={labels}
                  maxValue={maxValue}
                  noOfSections={5}
                  isAnimated
                  animationDuration={500}
                  labelsPositionOffset={maxValue * 0.08}
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
                  polygonConfigArray={[
                    {
                      stroke: parseRGB(brand.primary['500']),
                      fill: parseRGB(brand.primary['400']),
                      strokeWidth: 2,
                      opacity: 0.6,
                    },
                    {
                      stroke: parseRGB(tailwindColors.orange['500']),
                      fill: parseRGB(tailwindColors.orange['400']),
                      strokeWidth: 2,
                      opacity: 0.6,
                    },
                  ]}
                />
              </Box>
            </VStack>
          );
        }}
      </ChartWrapperCard>
    </VStack>
  );
};

export default CommunityGenreRadarChart;
