import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { HStack } from '@gamelog/common/gluestack/hstack';
import StatBlock from '@gamelog/common/StatBlock';

export type GameStat = {
  value: string;
  label: string;
  valueClassName?: string;
};

const StatBand = ({
  stats,
  isOnCard = false,
  testID,
  isLandscape = false,
}: {
  stats: GameStat[];
  isOnCard?: boolean;
  testID?: string;
  isLandscape?: boolean;
}) => (
  <Card
    testID={testID}
    variant="elevated"
    className={`overflow-hidden p-0 ${isLandscape ? 'min-h-[96px]' : ''} ${isOnCard ? 'bg-background-100 dark:bg-background-100 shadow-none' : ''}`}
  >
    <HStack className={`w-full ${isLandscape ? 'min-h-[96px]' : ''}`}>
      {stats.map((stat, index) => (
        <HStack key={stat.label} className="flex-1">
          {index > 0 && <Box className="w-px bg-outline-100" />}
          <StatBlock
            value={stat.value}
            label={stat.label}
            valueClassName={stat.valueClassName}
            isOnCard={isOnCard}
            isLandscape={isLandscape}
          />
        </HStack>
      ))}
    </HStack>
  </Card>
);

export default StatBand;
