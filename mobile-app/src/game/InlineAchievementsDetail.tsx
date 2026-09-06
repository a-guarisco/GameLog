import { Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { GlobalAchievement } from '@gamelog/api-manager/dto';
import AchievementItem from '@gamelog/game/AchievementItem';
import AchievementsProgressBar from '@gamelog/game/AchievementsProgressBar';
import useAchievementsData from '@gamelog/game/useAchievementsData';

interface InlineAchievementsDetailProps {
  gameID: string;
  playerID: string;
  globalAchievements?: GlobalAchievement | null;
  onBack: () => void;
}

const InlineAchievementsDetail = ({
  gameID,
  playerID,
  globalAchievements,
  onBack,
}: InlineAchievementsDetailProps) => {
  const {
    mergedAchievements,
    unlockedCount,
    totalCount,
    completionPercent,
    gameName,
    isLoading,
    error,
  } = useAchievementsData(gameID, playerID, globalAchievements);

  return (
    <VStack space="lg" className="w-full pb-6">
      {/* Top bar with Back to Tabs button */}
      <HStack className="items-center justify-between pb-3 border-b border-outline-100">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to Tabs"
          testID="back-to-tabs"
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background-100 border border-outline-100"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
          <Text size="sm" className="font-semibold text-typography-0">
            Back to Tabs
          </Text>
        </Pressable>

        <Text size="sm" className="font-bold text-typography-200">
          All Achievements
        </Text>
      </HStack>

      {/* Content */}
      {isLoading ? (
        <LoadingBox className="py-12 shadow-xl" message="Loading achievements..." />
      ) : error ? (
        <ErrorBox
          className="py-12"
          errorMessage="Failed to load achievements, please try again later."
        />
      ) : (
        <VStack space="xl">
          <AchievementsProgressBar
            gameName={gameName}
            unlockedCount={unlockedCount}
            totalCount={totalCount}
            completionPercent={completionPercent}
          />

          {mergedAchievements.length === 0 ? (
            <InfoBox message="No achievements found for this game." />
          ) : (
            <VStack space="sm">
              {mergedAchievements.map((item, index) => (
                <AchievementItem
                  key={item.name || index}
                  name={item.name}
                  displayName={item.displayName}
                  percentage={item.percent}
                  unlockTime={item.unlockTime}
                  description={item.description}
                />
              ))}
            </VStack>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default InlineAchievementsDetail;
