import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';

export type GameStat = {
  value: string;
  label: string;
};

/**
 * A third of the screen is not enough for a full date on one line, so values get two
 * lines inside a fixed-height slot — that keeps the labels aligned across columns
 * whether the value wraps or not.
 */
const GameStatBand = ({ stats }: { stats: GameStat[] }) => (
  <HStack className="overflow-hidden rounded-xl border border-outline-100 bg-background-100">
    {stats.map((stat, index) => (
      <HStack key={stat.label} className="flex-1">
        {index > 0 && <Box className="w-px bg-outline-100" />}
        <VStack className="flex-1 px-3 py-3" space="xs">
          {/* 48px == two lines of text-base, so a wrapped value is never clipped. */}
          <Box className="min-h-12 justify-start">
            <Text size="md" className="font-bold text-typography-0" numberOfLines={2}>
              {stat.value}
            </Text>
          </Box>
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
