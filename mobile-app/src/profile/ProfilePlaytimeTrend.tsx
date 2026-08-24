import { useMemo } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';
import type { PlaytimeTrend } from './playtimeTrendSelectors';
import { BarChart } from 'react-native-gifted-charts';
import { brand } from '@gamelog/theme/theme';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

interface ProfilePlaytimeTrendProps {
  trend: PlaytimeTrend;
  hasError?: boolean;
}

const ProfilePlaytimeTrend = ({ trend, hasError = false }: ProfilePlaytimeTrendProps) => {
  const barData = useMemo(() => {
    return trend.days.map((day) => ({
      value: day.minutes,
      label: day.label,
      frontColor: parseRGB(day.isToday ? brand.primary['300'] : brand.primary['400']),
    }));
  }, [trend.days]);

  return (
    <ChartWrapperCard
      label={`Playtime · last ${trend.days.length} days`}
      isLoading={false}
      error={hasError}
      testID="profile-playtime-trend"
      ErrorBehaviour={() => (
        <Text className="text-center text-error-500 my-4">Could not load playtime history</Text>
      )}
    >
      {({ cardWidth, theme }) => {
        if (!trend.hasPlaytime) {
          return (
            <Box className="py-8 items-center justify-center">
              <Text className="text-typography-400">No playtime in this window</Text>
            </Box>
          );
        }

        const axisColor = parseRGB(theme['--color-typography-200']);

        return (
          <VStack space="sm" className="w-full">
            <HStack space="sm" className="items-baseline w-full">
              <Text size="xl" className="font-bold text-typography-0">
                {trend.totalLabel}
              </Text>
              {!!trend.peakLabel && (
                <Text size="xs" className="text-typography-300">
                  peak {trend.peakLabel}
                </Text>
              )}
            </HStack>

            <Box
              style={{ overflow: 'hidden', width: '100%', alignItems: 'center', marginLeft: -20 }}
            >
              <BarChart
                parentWidth={cardWidth || 370}
                adjustToWidth
                data={barData}
                barWidth={16}
                spacing={12}
                initialSpacing={10}
                isAnimated
                animationDuration={400}
                barBorderRadius={4}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                hideYAxisText
                xAxisColor={axisColor}
                yAxisTextStyle={{ color: axisColor, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: axisColor, fontSize: 10, textAlign: 'center' }}
                dashWidth={0}
              />
            </Box>

            <Text size="xs" className="text-typography-300 text-center mt-2">
              Played {trend.activeDaysLabel}.
            </Text>
          </VStack>
        );
      }}
    </ChartWrapperCard>
  );
};

export default ProfilePlaytimeTrend;
