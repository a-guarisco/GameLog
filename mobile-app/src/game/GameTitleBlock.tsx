import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import Chip from '@gamelog/common/game/Chip';
import { formatThousands } from '@gamelog/utils/formatUtils';

interface GameTitleBlockProps {
  name: string;
  livePlayers: number;
  streakText: string;
}

/**
 * Title, live player count and streak live below the artwork rather than on top of it:
 * the hero image is arbitrary marketing art, so no scrim makes overlaid text reliably
 * readable. Sitting on the page background instead, the tokens below resolve correctly
 * in both light and dark mode.
 */
const GameTitleBlock = ({ name, livePlayers, streakText }: GameTitleBlockProps) => (
  <VStack space="sm" className="items-center px-4">
    <Text
      size="4xl"
      className="text-center font-bold text-typography-0 pt-8 pb-2"
      style={{ letterSpacing: -0.5 }}
      numberOfLines={2}
    >
      {name}
    </Text>

    <HStack space="sm" className="flex-wrap items-center justify-center">
      {/* Solid fill rather than a tint: white on primary-500 holds its contrast in either theme. */}
      <Chip className="border-primary-500 bg-primary-500">
        <Box className="h-1.5 w-1.5 rounded-full bg-white" />
        <Text size="xs" className="font-bold text-white">
          {formatThousands(livePlayers)} playing now
        </Text>
      </Chip>

      <Chip className="border-outline-200 bg-background-100">
        <Text size="xs" className="font-bold text-typography-100">
          {streakText}
        </Text>
      </Chip>
    </HStack>
  </VStack>
);

export default GameTitleBlock;
