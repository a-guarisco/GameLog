import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import Chip from '@gamelog/common/Chip';
import { formatThousands } from '@gamelog/utils/formatUtils';

interface GameStatusChipsProps {
  livePlayers: number;
  streakText: string;
}

/**
 * Live player count and streak, sitting under the banner title. On the page background
 * rather than over the artwork, so the tokens resolve in both light and dark mode.
 */
const GameStatusChips = ({ livePlayers, streakText }: GameStatusChipsProps) => (
  <HStack space="sm" className="flex-wrap items-center justify-center px-4">
    {/* Solid fill rather than a tint: white on primary-500 holds its contrast in either theme. */}
    <Chip className="border-primary-500 bg-primary-500">
      <Box className="h-1.5 w-1.5 rounded-full bg-white" />
      <Text size="xs" className="font-bold text-white">
        {formatThousands(livePlayers)} playing now
      </Text>
    </Chip>

    <Chip className="border-outline-200 bg-background-200">
      <Text size="xs" className="font-bold text-typography-100">
        {streakText}
      </Text>
    </Chip>
  </HStack>
);

export default GameStatusChips;
