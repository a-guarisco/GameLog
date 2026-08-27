import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';

export type GameStat = {
  value: string;
  label: string;
};

const StatBand = ({ stats }: { stats: GameStat[] }) => (
  <Card variant="elevated" className="overflow-hidden p-0">
    <HStack className="w-full">
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
  </Card>
);

export default StatBand;
