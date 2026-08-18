import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';

export type GameStat = {
  value: string;
  label: string;
};

const StatBand = ({ stats }: { stats: GameStat[] }) => (
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

export default StatBand;
