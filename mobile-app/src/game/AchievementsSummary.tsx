import { Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import ProgressTrack from '@gamelog/common/ProgressTrack';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

interface AchievementsSummaryProps {
  unlockedCount: number;
  totalCount: number;
  completionPercent: number;
  onPress: () => void;
}

const AchievementsSummary = ({
  unlockedCount,
  totalCount,
  completionPercent,
  onPress,
}: AchievementsSummaryProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Achievements, ${unlockedCount} of ${totalCount} unlocked, ${completionPercent} percent. View all achievements`}
    accessibilityValue={{ min: 0, max: 100, now: completionPercent }}
    testID="achievements-summary"
    hitSlop={{ top: 8, bottom: 8 }}
  >
    <VStack space="sm">
      <HStack className="items-center justify-between">
        <Text size="sm" className="font-bold text-typography-0">
          Achievements
        </Text>
        <HStack space="xs" className="items-center">
          <Text size="sm" className="font-bold text-typography-200">
            {unlockedCount} / {totalCount} · {completionPercent}%
          </Text>
          <Ionicons name="chevron-forward" size={14} color={toHex(brand.primary['300'])} />
        </HStack>
      </HStack>
      <ProgressTrack percent={completionPercent} testID="achievements-summary-fill" />
    </VStack>
  </Pressable>
);

export default AchievementsSummary;
