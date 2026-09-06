import { useState, memo } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RadarChart } from 'react-native-gifted-charts';
import ChartWrapperCard from '../ChartWrapperCard';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { GLSegmentedControl, GLSegmentOption } from '@gamelog/common/GLSegmentedControl';
import { ErrorBox } from '@gamelog/common/feedbacks';
import ProgressTrack from '@gamelog/common/ProgressTrack';
import { parseRGB } from '../chartsHelpers';
import { useCommunityGenreRadarChart } from './useCommunityGenreRadarChart';
import { useOrientation } from '@gamelog/common/useOrientation';
import type { OwnedGames, CommunityScope } from '@gamelog/api-manager/dto';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

interface CommunityGenreRadarChartProps {
  ownedGames?: OwnedGames | null;
  scope?: CommunityScope;
  targetUserId?: string;
  targetUserName?: string;
  chartTitle?: string;
  hideScopeSelector?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  style?: ViewStyle;
}

const SCOPE_OPTIONS: GLSegmentOption<CommunityScope>[] = [
  { id: 'global', label: 'Global', testID: 'community-radar-scope-global' },
  { id: 'region', label: 'Region', testID: 'community-radar-scope-region' },
  { id: 'friends', label: 'Friends', testID: 'community-radar-scope-friends' },
];

export const MAX_RADAR_SIZE = 400;

interface MemoizedCommunityRadarProps {
  targetSize?: number;
  cardWidth?: number;
  radarPadding?: number;
  dataSet: number[][];
  labels: string[];
  maxValue: number;
  theme: any;
}

const MemoizedCommunityRadar = memo(
  ({ targetSize, cardWidth, radarPadding, dataSet, labels, maxValue, theme }: MemoizedCommunityRadarProps) => {
    const size = targetSize ?? Math.min(cardWidth ? cardWidth - (radarPadding ?? 16) : 320, MAX_RADAR_SIZE);
    return (
      <Box
        className="items-center justify-center w-full"
        style={{ marginTop: -15, marginBottom: -10 }}
      >
        <RadarChart
          chartSize={size}
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
            stroke: HEX_COLORS.comparison.user.gradientHex,
            strokeWidth: 1,
            strokeDashArray: [0, 0],
          }}
          labelConfig={{
            stroke: parseRGB(theme['--color-typography-400']),
          }}
          polygonConfigArray={[
            {
              stroke: HEX_COLORS.comparison.user.hex,
              fill: HEX_COLORS.comparison.user.gradientHex,
              strokeWidth: 2,
              opacity: 0.8,
            },
            {
              stroke: HEX_COLORS.comparison.compare.hex,
              fill: HEX_COLORS.comparison.compare.gradientHex,
              strokeWidth: 2,
              opacity: 0.5,
            },
          ]}
        />
      </Box>
    );
  }
);
MemoizedCommunityRadar.displayName = 'MemoizedCommunityRadar';

const CommunityGenreRadarChart = ({
  ownedGames,
  scope: initialScope = 'global',
  targetUserId,
  targetUserName,
  chartTitle,
  hideScopeSelector = false,
  onExpandedChange,
  style,
}: CommunityGenreRadarChartProps) => {
  const [scope, setScope] = useState<CommunityScope>(initialScope);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isLandscape, height } = useOrientation();
  const radarPadding = isLandscape ? 8 : 16;

  const handleToggleExpand = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  const currentScope = hideScopeSelector || targetUserId ? initialScope : scope;

  const {
    dataSet,
    labels,
    comparisonItems,
    maxValue,
    isLoading,
    errorCommunity,
    errorMessageCommunity,
  } = useCommunityGenreRadarChart(ownedGames, currentScope, targetUserId);

  const renderError = () => (
    <Box className="py-6 items-center justify-center w-full">
      <ErrorBox
        errorMessage={errorMessageCommunity || 'Unable to load community genre data.'}
        variant="icon-top"
        className="w-full"
      />
    </Box>
  );

  const displayTitle =
    chartTitle || (targetUserName ? `${targetUserName}'s Radar` : 'Community Radar');
  const othersLabel = targetUserName ? `${targetUserName} (%)` : 'Others (%)';
  const showScopeControl = !hideScopeSelector && !targetUserId && currentScope !== 'user';

  return (
    <ChartWrapperCard
      label={displayTitle}
      headerRight={
        showScopeControl ? (
          <Box className="w-[190px]">
            <GLSegmentedControl<CommunityScope>
              options={SCOPE_OPTIONS}
              activeId={scope}
              onSelect={setScope}
              isOnCard
            />
          </Box>
        ) : undefined
      }
      isLoading={isLoading}
      error={errorCommunity}
      ErrorBehaviour={renderError}
      style={style}
    >
      {({ theme, cardWidth }) => {
        if (dataSet.length === 0 || labels.length === 0) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400 font-medium text-center">
                No community genre data found
              </Text>
            </Box>
          );
        }

        const targetSize = isLandscape
          ? Math.min(Math.round(height * 0.55), cardWidth ? cardWidth - radarPadding : 240, MAX_RADAR_SIZE)
          : Math.min(cardWidth ? cardWidth - radarPadding : 320, MAX_RADAR_SIZE);

        return (
          <VStack className="w-full items-center" space="md">
            {/* Radar Chart */}
            <MemoizedCommunityRadar
              targetSize={targetSize}
              cardWidth={cardWidth}
              radarPadding={radarPadding}
              dataSet={dataSet}
              labels={labels}
              maxValue={maxValue}
              theme={theme}
            />

            {/* Caption / Legend below the graph */}
            <HStack space="lg" className="items-center justify-center pt-1 pb-1">
              <HStack space="xs" className="items-center">
                <Box
                  className="w-2.5 h-2.5 rounded-full bg-comparison-user-500"
                />
                <Text size="xs" className="font-bold text-primary-500">
                  You (%)
                </Text>
              </HStack>
              <HStack space="xs" className="items-center max-w-[50%]">
                <Box
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-comparison-compare-500"
                />
                <Text size="xs" className="font-bold text-comparison-compare-500" numberOfLines={2}>
                  {othersLabel}
                </Text>
              </HStack>
            </HStack>

            {/* Genre Breakdown List directly on card with side-by-side bar and percentage */}
            {isExpanded && (
              <VStack space="md" className="w-full pt-1">
                {comparisonItems.map((item) => (
                  <VStack key={item.id || item.description} space="xs" className="w-full">
                    <Text
                      size="xs"
                      className="font-bold uppercase text-typography-0"
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>

                    {/* You Row */}
                    <HStack space="sm" className="items-center w-full">
                      <Box className="flex-1">
                        <ProgressTrack
                          percent={item.userPercentage}
                          fillClassName="bg-primary-500"
                          className="h-1.5"
                          testID={`user-progress-${item.id || item.description}`}
                        />
                      </Box>
                      <Text size="xs" className="font-bold text-primary-500 w-12 text-right">
                        {item.userPercentage}%
                      </Text>
                    </HStack>

                    {/* Others Row */}
                    <HStack space="sm" className="items-center w-full">
                      <Box className="flex-1">
                        <ProgressTrack
                          percent={item.communityPercentage}
                          fillClassName="bg-comparison-compare-500"
                          className="h-1.5"
                          testID={`others-progress-${item.id || item.description}`}
                        />
                      </Box>
                      <Text
                        size="xs"
                        className="font-bold w-12 text-right text-comparison-compare-500"
                      >
                        {item.communityPercentage}%
                      </Text>
                    </HStack>
                  </VStack>
                ))}
              </VStack>
            )}

            {/* Expand Toggle */}
            <Pressable
              onPress={handleToggleExpand}
              className="self-stretch py-1.5 items-center justify-center bg-background-50 active:bg-background-100 -mx-3 -mb-3 rounded-b-lg mt-1"
              testID="community-genre-expand-toggle"
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
            >
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={HEX_COLORS.muted.icon.hex}
              />
            </Pressable>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default CommunityGenreRadarChart;
