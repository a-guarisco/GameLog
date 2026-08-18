import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';

export type GameStat = {
  value: string;
  label: string;
};

/**
 * A third of the screen is not enough for a full date on one line, so values may wrap
 * onto a second line. Columns stretch to the tallest one and the label is pinned to the
 * bottom, so labels stay aligned across columns without padding out short values.
 */
const GameStatBand = ({ stats }: { stats: GameStat[] }) => (
  <HStack className="overflow-hidden rounded-xl border border-outline-100 bg-background-200">
    {stats.map((stat, index) => (
      <HStack key={stat.label} className="flex-1">
        {index > 0 && <Box className="w-px bg-outline-100" />}
        <VStack className="flex-1 justify-between px-3 py-3" space="xs">
          <Text size="md" className="font-bold text-typography-0" numberOfLines={2}>
            {stat.value}
          </Text>
          <Text
            size="2xs"
            className="font-bold uppercase text-typography-300"
            style={{ letterSpacing: 1 }}
            numberOfLines={1}
          >
            {stat.label}
          </Text>
        </VStack>
      </HStack>
    ))}
  </HStack>
);

export default GameStatBand;
