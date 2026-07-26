import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';

interface AchievementItemProps {
  name: string;
  displayName?: string;
  percentage: number;
  unlockTime?: number;
}

const AchievementItem = ({
  name,
  displayName,
  percentage,
  unlockTime,
}: AchievementItemProps) => {
  return (
    <Box className="relative overflow-hidden rounded-2xl border-2 border-outline-500 mb-3 h-20">
      <Box
        testID="global-progress-bar"
        className="absolute top-0 left-0 h-full bg-tertiary-500"
        style={{ width: `${percentage}%` }}
      />

      <HStack className="h-full px-5 items-center relative z-10" space="md">
        <VStack className="flex-1 items-center justify-center">
          <Text size="xl" className="font-bold uppercase text-center">
            {displayName || name}
          </Text>
          {unlockTime && (
            <Text size="sm" className="font-mono text-center">
              Achievement unlocked on: {new Date(unlockTime * 1000).toLocaleDateString()}
            </Text>
          )}
        </VStack>

        <Box className="border-2 border-outline-500 rounded-xl px-4 py-1 bg-background-300">
          <Text size="sm" className="font-bold">
            {percentage}%
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default AchievementItem;
