import { Card } from '@gamelog/common/gluestack/card';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import AchievementIcon from '@gamelog/game/AchievementIcon';
import { formatAchievementName } from '@gamelog/utils/formatUtils';

interface AchievementItemProps {
  name: string;
  displayName?: string;
  percentage: number;
  unlockTime?: number;
  description?: string;
}

const getRarity = (percentage: number) => {
  if (percentage < 5)
    return {
      label: 'Legendary',
      colorClass: 'text-amber-500 dark:text-amber-400',
    };
  if (percentage < 20)
    return {
      label: 'Rare',
      colorClass: 'text-primary-400 dark:text-primary-300',
    };
  if (percentage < 50)
    return {
      label: 'Uncommon',
      colorClass: 'text-teal-500 dark:text-teal-400',
    };
  return {
    label: 'Common',
    colorClass: 'text-typography-300 dark:text-typography-400',
  };
};

const AchievementItem = ({
  name,
  displayName,
  percentage,
  unlockTime,
  description,
}: AchievementItemProps) => {
  const safePercentage = Number(percentage);
  const normalizedPercentage = Number.isFinite(safePercentage) ? safePercentage : 0;
  const isUnlocked = !!unlockTime;
  const rarity = getRarity(normalizedPercentage);

  return (
    <Card variant="elevated" className="relative overflow-hidden p-0">
      <Box
        testID="global-progress-bar"
        className={`absolute top-0 left-0 h-full ${
          isUnlocked
            ? 'bg-primary-500/15 dark:bg-primary-400/15'
            : 'bg-background-300/30 dark:bg-background-700/30'
        }`}
        style={{ width: `${normalizedPercentage}%` }}
      />

      <HStack space="md" className="relative z-10 px-3 py-3 items-start">
        <Box
          className={`w-10 h-10 rounded-lg items-center justify-center shrink-0 ${
            isUnlocked
              ? 'bg-primary-500/15 dark:bg-primary-500/25 border border-primary-500/30'
              : 'bg-background-100 dark:bg-background-200 border border-outline-100 dark:border-outline-50'
          }`}
        >
          <AchievementIcon isUnlocked={isUnlocked} />
        </Box>

        <VStack className="flex-1">
          <Text size="sm" className="font-bold uppercase text-typography-0" numberOfLines={1}>
            {displayName ? displayName : formatAchievementName(name)}
          </Text>
          <Text size="xs" className="font-medium text-typography-200 mt-0.5">
            <Text size="xs" className={`font-bold mt-0.5 ${rarity.colorClass}`}>
              {rarity.label}
            </Text>{' '}
            · {normalizedPercentage.toFixed(1)}% of players
          </Text>
          {description && (
            <Text size="xs" className="text-typography-100 mt-1" numberOfLines={2}>
              {description}
            </Text>
          )}
          {isUnlocked && (
            <Text size="xs" className="text-primary-500 dark:text-primary-400 font-medium mt-1">
              Unlocked {new Date(unlockTime! * 1000).toLocaleDateString()}
            </Text>
          )}
        </VStack>
      </HStack>
    </Card>
  );
};

export default AchievementItem;
