import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';
import SectionState from '@gamelog/common/SectionState';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import type { PlatformSplit } from './platformSplitSelectors';

const RAMP = [
  { fill: 'bg-primary-500', hex: toHex(brand.primary['500']) },
  { fill: 'bg-primary-300', hex: toHex(brand.primary['300']) },
  { fill: 'bg-primary-200', hex: toHex(brand.primary['200']) },
  { fill: 'bg-primary-100', hex: toHex(brand.primary['100']) },
];

const rampTone = (rank: number) => RAMP[Math.min(rank, RAMP.length - 1)];

interface ProfilePlatformSplitProps {
  split: PlatformSplit;
  hasError?: boolean;
}

const ProfilePlatformSplit = ({ split, hasError = false }: ProfilePlatformSplitProps) => (
  <SectionCard label="Hours by platform" testID="profile-platform-split">
    <SectionState
      hasError={hasError}
      isEmpty={!split.hasPlaytime}
      errorMessage="Could not load platform playtime"
      emptyMessage="No platform playtime recorded yet"
    />

    {!hasError && split.hasPlaytime && (
      <VStack space="sm">
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
              className={rampTone(rank).fill}
              style={{ flexGrow: share.percent, flexBasis: 0, minWidth: 3 }}
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
    )}
  </SectionCard>
);

export default ProfilePlatformSplit;
