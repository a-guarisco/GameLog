import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { tailwindColors } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';
import { CHART_PALETTE } from '@gamelog/theme/metrics';
import type { PlatformSplit } from './selectPlatformSplit';

import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';

const RAMP = [
  { hex: CHART_PALETTE[0] },
  { hex: CHART_PALETTE[1] },
  { hex: CHART_PALETTE[2] },
  { hex: CHART_PALETTE[3] },
  { hex: CHART_PALETTE[4] },
  { hex: CHART_PALETTE[5] },
];

const rampTone = (rank: number) => RAMP[rank % RAMP.length];

interface ProfilePlatformSplitProps {
  split: PlatformSplit;
  hasError?: boolean;
}

const PlatformSplitChart = ({ split, hasError = false }: ProfilePlatformSplitProps) => (
  <ChartWrapperCard
    label="Hours by platform"
    testID="profile-platform-split"
    isLoading={false}
    error={hasError}
    ErrorBehaviour={() => (
      <Box className="py-8 items-center justify-center w-full">
        <Text className="text-typography-400">Could not load platform playtime</Text>
      </Box>
    )}
  >
    {({ cardWidth, theme }) => {
      if (!split.hasPlaytime) {
        return (
          <Box className="py-8 items-center justify-center w-full">
            <Text className="text-typography-400">No platform playtime recorded yet</Text>
          </Box>
        );
      }

      return (
        <VStack space="sm" className="w-full">
          <HStack space="sm" className="items-baseline">
            <Text size="xl" className="font-bold text-typography-0">
              {split.totalLabel}
            </Text>
            <Text size="xs" className="text-typography-300">
              across {split.shares.length === 1 ? '1 platform' : `${split.shares.length} platforms`}
            </Text>
          </HStack>

          {/* flexGrow rather than a width percentage: a sliver still clears its minimum width
              without the segments together overflowing the track. */}
          <HStack className="h-2.5 w-full overflow-hidden rounded-full bg-background-300">
            {split.shares.map((share, rank) => (
              <Box
                key={share.id}
                style={{
                  backgroundColor: rampTone(rank).hex,
                  flexGrow: share.percent,
                  flexBasis: 0,
                  minWidth: 3,
                }}
                testID={`profile-platform-segment-${share.id}`}
              />
            ))}
          </HStack>

          <VStack>
            {split.shares.map((share, rank) => (
              <HStack
                key={share.id}
                space="sm"
                className={`items-center py-2.5 ${rank === 0 ? '' : 'border-t border-outline-100'}`}
              >
                <Ionicons name={share.icon as any} size={16} color={rampTone(rank).hex} />

                <Text size="sm" className="flex-1 font-bold text-typography-0" numberOfLines={1}>
                  {share.name}
                </Text>

                <Text size="xs" className="text-typography-300">
                  {share.hoursLabel}
                </Text>

                <Text
                  size="xs"
                  className="w-10 text-right font-bold text-typography-0"
                  testID={`profile-platform-percent-${share.id}`}
                >
                  {share.percentLabel}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      );
    }}
  </ChartWrapperCard>
);

export default PlatformSplitChart;
