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
}

const getRarity = (percentage: number) => {
  if (percentage < 5) {
    return {
      label: 'Legendary',
      badge: 'bg-warning-500 border-warning-600',
      fill: 'bg-warning-500',
    };
  }
  if (percentage < 20) {
    return { label: 'Rare', badge: 'bg-info-500 border-info-600', fill: 'bg-info-500' };
  }
  if (percentage < 50) {
    return {
      label: 'Uncommon',
      badge: 'bg-success-500 border-success-600',
      fill: 'bg-success-500',
    };
  }
  return {
    label: 'Common',
    badge: 'bg-background-300 border-outline-400',
    fill: 'bg-background-400',
  };
};

const AchievementItem = ({ name, percentage, unlockTime }: AchievementItemProps) => {
  const safePercentage = Number(percentage);
  const normalizedPercentage = Number.isFinite(safePercentage) ? safePercentage : 0;
  const isUnlocked = !!unlockTime;
  const rarity = getRarity(normalizedPercentage);

  return (
    <Box
      className={`relative overflow-hidden rounded-lg border mb-3 bg-background-50 ${isUnlocked ? 'border-success-500' : 'border-error-500'
        }`}
    >
      <Box
        testID="global-progress-bar"
        className={`absolute top-0 left-0 h-full ${rarity.fill} opacity-15`}
        style={{ width: `${safePercentage}%` }}
      />

      <HStack className="min-h-16 px-3 py-3 items-center relative z-10" space="md">
        <Box
          className={`w-10 h-10 rounded-md items-center justify-center border ${isUnlocked
              ? 'bg-success-100 border-success-300'
              : 'bg-background-100 border-error-500'
            }`}
        >
          <Text size="md">{isUnlocked ? '🏆' : '🔒'}</Text>
        </Box>

        <VStack className="flex-1 justify-center">
          <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
            {formatAchievementName(name)}
          </Text>
          <Text size="xs" className="font-medium text-typography-500 mt-0.5">
            {rarity.label} · {safePercentage.toFixed(1)}% of players
          </Text>
          {isUnlocked && (
            <Text size="xs" className="text-success-700 mt-0.5">
              Unlocked {new Date(unlockTime! * 1000).toLocaleDateString()}
            </Text>
          )}
        </VStack>

        <Box className={`rounded-md px-2.5 py-1 border ${rarity.badge}`}>
          <Text size="sm" className="font-semibold text-typography-900">
            {Math.round(safePercentage)}%
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default AchievementItem;
