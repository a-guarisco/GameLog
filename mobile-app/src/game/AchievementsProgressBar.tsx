import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { HStack } from '@gamelog/common/gluestack/hstack';

const AchievementsProgressBar = ({
  unlockedCount,
  totalCount,
  completionPercent,
}: {
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
}) => {
  return (
    <Box className="relative overflow-hidden rounded-lg bg-background-200 shadow-xl">
      <Box
        className="absolute top-0 left-0 h-full bg-success-500 opacity-15"
        style={{ width: `${completionPercent}%` }}
      />
      <HStack className="h-10 items-center justify-center px-3 relative z-10">
        <Text size="sm" className="font-bold">
          {unlockedCount} / {totalCount} unlocked · {completionPercent}%
        </Text>
      </HStack>
    </Box>
  );
};

export default AchievementsProgressBar;
