import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { HStack } from '@gamelog/common/gluestack/hstack';
import StatBlock from '@gamelog/common/StatBlock';

export type GameStat = {
  value: string;
  label: string;
  valueClassName?: string;
};

const StatBand = ({ stats, isOnCard = false }: { stats: GameStat[]; isOnCard?: boolean }) => (
  <Card variant="elevated" className={`overflow-hidden p-0 ${isOnCard ? 'bg-background-100 dark:bg-background-100 shadow-none' : ''}`}>
    <HStack className="w-full">
      {stats.map((stat, index) => (
        <HStack key={stat.label} className="flex-1">
          {index > 0 && <Box className="w-px bg-outline-100" />}
          <StatBlock value={stat.value} label={stat.label} valueClassName={stat.valueClassName} isOnCard={isOnCard} />
        </HStack>
      ))}
    </HStack>
  </Card>
);

export default StatBand;
