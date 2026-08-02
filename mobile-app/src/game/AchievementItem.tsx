import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatAchievementName } from '@gamelog/utils/formatUtils';

interface AchievementItemProps {
  name: string;
  displayName?: string;
  percentage: number;
  unlockTime?: number;
  description?: string;
}

const getRarity = (percentage: number) => {
  if (percentage < 5) return { label: 'Legendary', fill: 'bg-warning-500' };
  if (percentage < 20) return { label: 'Rare', fill: 'bg-info-500' };
  if (percentage < 50) return { label: 'Uncommon', fill: 'bg-success-500' };
  return { label: 'Common', fill: 'bg-background-400' };
};

const getLockedFillColor = (locked: boolean) => {
  if (locked) {
    return 'bg-warning-500';
  }
  return 'bg-success-500';
};

const AchievementItem = ({ name, percentage, unlockTime, description }: AchievementItemProps) => {
  const safePercentage = Number(percentage);
  const normalizedPercentage = Number.isFinite(safePercentage) ? safePercentage : 0;
  const isUnlocked = !!unlockTime;
  const rarity = getRarity(normalizedPercentage);
  const lockedFillColor = getLockedFillColor(!isUnlocked);

  return (
    <Box className="relative overflow-hidden rounded-lg mb-3 bg-background-100">
      <Box
        testID="global-progress-bar"
        className={`absolute top-0 left-0 h-full ${lockedFillColor} opacity-15`}
        style={{ width: `${normalizedPercentage}%` }}
      />

      <HStack space="md" className="relative z-10 px-3 py-3 items-start">
        <Box
          className={`w-10 h-10 rounded-md items-center justify-center shrink-0 ${
            isUnlocked ? 'bg-success-100' : 'bg-background-200'
          }`}
        >
          <Text size="md">{isUnlocked ? '🏆' : '🔒'}</Text>
        </Box>

        <VStack className="flex-1">
          <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
            {formatAchievementName(name)}
          </Text>
          <Text size="xs" className="font-medium text-typography-500 mt-0.5">
            {rarity.label} · {normalizedPercentage.toFixed(1)}% of players
          </Text>
          {description && (
            <Text size="xs" className="text-typography-600 mt-1" numberOfLines={2}>
              {description}
            </Text>
          )}
          {isUnlocked && (
            <Text size="xs" className="text-success-700 mt-1">
              Unlocked {new Date(unlockTime! * 1000).toLocaleDateString()}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

export default AchievementItem;
