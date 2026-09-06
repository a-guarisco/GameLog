import { Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Card } from '@gamelog/common/gluestack/card';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

interface RecommenderSummaryCardProps {
  onPress: () => void;
  testID?: string;
}

export const RecommenderSummaryCard: React.FC<RecommenderSummaryCardProps> = ({
  onPress,
  testID = 'recommender-summary-card',
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Game Recommender. Discover shared games and top recommendations with friends"
      testID={testID}
    >
      <Card variant="elevated" className="p-4 bg-background-50 border border-outline-100">
        <HStack space="md" className="items-center justify-between">
          <Box className="w-10 h-10 rounded-full bg-primary-500/15 items-center justify-center">
            <Ionicons name="sparkles" size={20} color={HEX_COLORS.recommender.sparkles.hex} />
          </Box>

          <VStack className="flex-1 pr-2">
            <Text size="sm" className="font-bold text-typography-0 uppercase">
              Game Recommender
            </Text>
            <Text size="xs" className="text-typography-400 mt-0.5" numberOfLines={2}>
              Compare common games, shared genres & top picks with friends
            </Text>
          </VStack>

          <HStack className="h-8 items-center justify-center">
            <Ionicons name="chevron-forward" size={16} color={toHex(brand.primary['300'])} />
          </HStack>
        </HStack>
      </Card>
    </Pressable>
  );
};

export default RecommenderSummaryCard;
