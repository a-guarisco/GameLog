import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Easing, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { PieChart } from 'react-native-gifted-charts';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { WarningBox } from '@gamelog/common/feedbacks';
import ProgressTrack from '@gamelog/common/ProgressTrack';
import ChartWrapperCard from '../ChartWrapperCard';
import { parseRGB } from '../chartsHelpers';
import { brand, tailwindColors } from '@gamelog/theme/theme';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useCommunityGameStatus } from './useCommunityGameStatus';
import { useCommunityGameStatusData } from './useCommunityGameStatusData';
import type { CommunityScope } from '@gamelog/api-manager/dto';

interface CommunityGameStatusChartProps {
  scope?: CommunityScope;
}

interface DonutItemProps {
  title: string;
  data: any[];
  count: string | number;
  subtitle: string;
  radius: number;
  innerRadius: number;
  theme: any;
  testID?: string;
}

const Tooltip = memo(({ item, theme }: any) => {
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
        {item.value}%
      </Text>
    </Box>
  );
});
Tooltip.displayName = 'Tooltip';

const SingleDonut = memo(
  ({ title, data, count, subtitle, radius, innerRadius, theme, testID }: DonutItemProps) => {
    const scale = useRef(new Animated.Value(0.3)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.back(1.15)),
          useNativeDriver: true,
        }),
      ]).start();
    }, [opacity, scale]);

    const renderCenter = () => (
      <VStack
        className="items-center justify-center pointer-events-none"
        style={{
          width: innerRadius * 2,
          height: innerRadius * 2,
        }}
      >
        <Text
          className="font-bold text-typography-0 text-center"
          style={{ fontSize: radius > 60 ? 20 : 17, lineHeight: radius > 60 ? 24 : 20 }}
          numberOfLines={1}
        >
          {count}
        </Text>
        <Text
          className="text-typography-400 font-medium text-center"
          style={{ fontSize: 10, lineHeight: 12 }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </VStack>
    );

    const renderTooltip = useCallback(
      (index: number) => <Tooltip item={data[index]} theme={theme} />,
      [data, theme]
    );

    return (
      <VStack className="items-center flex-1" space="xs" testID={testID}>
        <Text size="sm" className="font-bold text-typography-0 text-center mb-1">
          {title}
        </Text>
        <Animated.View
          style={{
            opacity,
            transform: [{ scale }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieChart
            data={data}
            donut
            radius={radius}
            innerRadius={innerRadius}
            innerCircleColor={parseRGB(theme['--color-background-50'])}
            centerLabelComponent={renderCenter}
            showValuesAsLabels={false}
            showTextBackground={false}
            showTooltip
            tooltipComponent={renderTooltip}
          />
        </Animated.View>
      </VStack>
    );
  }
);
SingleDonut.displayName = 'SingleDonut';

const computeDonutRadius = (cardWidth: number, isLandscape: boolean) => {
  const halfWidth = cardWidth > 0 ? (cardWidth - 32) / 2 : 160;
  const target = Math.floor(halfWidth * 0.42);
  return Math.min(isLandscape ? 76 : 68, Math.max(48, target));
};

const CommunityGameStatusChart = ({ scope = 'global' }: CommunityGameStatusChartProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isLandscape } = useOrientation();
  const { data, isLoading, error, errorMessage } = useCommunityGameStatus(scope);

  const {
    comparisonItems,
    userPieData,
    communityPieData,
    userTotalGames,
    communityTotalGamesFormatted,
    hasData,
  } = useCommunityGameStatusData({ data });

  const renderError = () => (
    <Box className="py-6 items-center justify-center w-full">
      <WarningBox
        message={errorMessage || 'Unable to load library status breakdown.'}
        className="w-full"
      />
    </Box>
  );

  return (
    <ChartWrapperCard
      label="Library Status Breakdown"
      isLoading={isLoading}
      error={error}
      ErrorBehaviour={renderError}
      testID="community-game-status-chart"
    >
      {({ cardWidth, theme }) => {
        if (!hasData) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400">No game status data found</Text>
            </Box>
          );
        }

        const radius = computeDonutRadius(cardWidth, isLandscape);
        const innerRadius = Math.floor(radius * 0.7);

        return (
          <VStack className="w-full items-center" space="lg">
            {/* 2 Donut Charts side-by-side */}
            <HStack className="w-full justify-around items-center pt-2">
              <SingleDonut
                title="You"
                data={userPieData}
                count={userTotalGames}
                subtitle="Games"
                radius={radius}
                innerRadius={innerRadius}
                theme={theme}
                testID="user-donut-chart"
              />
              <SingleDonut
                title="Others (avg)"
                data={communityPieData}
                count={communityTotalGamesFormatted}
                subtitle="Games avg"
                radius={radius}
                innerRadius={innerRadius}
                theme={theme}
                testID="community-donut-chart"
              />
            </HStack>

            <Text size="xs" className="text-typography-300 text-center">
              Comparing your game statuses with{' '}
              {scope === 'global'
                ? 'the global community'
                : scope === 'region'
                  ? 'your region'
                  : 'your friends'}
              .
            </Text>

            {/* Status Breakdown List & Legend */}
            {isExpanded && (
              <VStack space="md" className="w-full pt-1">
                {/* Caption / Legend */}
                <HStack space="lg" className="items-center justify-center pb-1">
                  <HStack space="xs" className="items-center">
                    <Box
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: `rgb(${brand.primary['500']})` }}
                    />
                    <Text size="xs" className="font-bold text-primary-500">
                      You
                    </Text>
                  </HStack>
                  <HStack space="xs" className="items-center">
                    <Box
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: `rgb(${tailwindColors.purple['500']})` }}
                    />
                    <Text size="xs" className="font-bold text-purple-500">
                      Others
                    </Text>
                  </HStack>
                </HStack>

                {comparisonItems.map((item) => (
                  <VStack key={item.status} space="xs" className="w-full">
                    <Text
                      size="xs"
                      className="font-bold uppercase text-typography-0"
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>

                    {/* You Row */}
                    <HStack space="sm" className="items-center w-full">
                      <Box className="flex-1">
                        <ProgressTrack
                          percent={item.userPercentage}
                          fillClassName="bg-primary-500"
                          className="h-1.5"
                          testID={`user-status-progress-${item.status}`}
                        />
                      </Box>
                      <Text size="xs" className="font-bold text-primary-500 w-14 text-right">
                        {item.userPercentage}%
                      </Text>
                    </HStack>

                    {/* Others Row */}
                    <HStack space="sm" className="items-center w-full">
                      <Box className="flex-1">
                        <ProgressTrack
                          percent={item.communityPercentage}
                          fillClassName="bg-purple-500"
                          className="h-1.5"
                          testID={`others-status-progress-${item.status}`}
                        />
                      </Box>
                      <Text size="xs" className="font-bold text-purple-500 w-14 text-right">
                        {item.communityPercentage}%
                      </Text>
                    </HStack>
                  </VStack>
                ))}
              </VStack>
            )}

            {/* Expand Toggle */}
            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              className="self-stretch py-1.5 items-center justify-center bg-background-50 active:bg-background-100 -mx-3 -mb-3 rounded-b-lg mt-1"
              testID="community-status-expand-toggle"
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
            >
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#737373"
              />
            </Pressable>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default CommunityGameStatusChart;
