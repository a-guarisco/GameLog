import { useNavigation } from '@react-navigation/native';
import { GlobalAchievement } from '@gamelog/api-manager/dto';
import AchievementItem from '@gamelog/game/AchievementItem';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox, ErrorBox } from '@gamelog/common/feedbacks';
import HeaderGameImage from './HeaderGameImage';
import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { useGetGameStreak } from '@gamelog/api-manager/useApi';
import { useStreakText } from '@gamelog/common/useStreakText';
import useAchievementsData from './useAchievementsData';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import AchievementsProgressBar from './AchievementsProgressBar';

type AchievementsListViewProps = {
  globalAchievements: GlobalAchievement;
  gameID: string;
  playerID: string;
};

const AchievementsListView = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { globalAchievements, gameID, playerID } = route.params as AchievementsListViewProps;
  const { gameStreak, isLoadingGameStreak } = useGetGameStreak(gameID);
  const secondaryText = useStreakText(gameStreak?.streak, isLoadingGameStreak);

  const {
    mergedAchievements,
    unlockedCount,
    totalCount,
    completionPercent,
    gameName,
    isLoading,
    error,
  } = useAchievementsData(gameID, playerID, globalAchievements);

  const gameCapsuleImage = steamAssetUrls.getGameCapsuleImage(gameID);

  const content = isLoading ? (
    <LoadingBox className="flex-1 shadow-xl" message="Loading achievements..." />
  ) : error ? (
    <ErrorBox
      className="flex-1"
      errorMessage="Failed to load achievements, please try again later."
    />
  ) : (
    <>
      <HeaderGameImage appid={gameID} />
      <ScrollablePage>
        <BannerInfo
          className="bg-background-100 shadow-xl"
          title={gameName}
          iconUrl={gameCapsuleImage}
          secondaryText={secondaryText}
        />

        <Box className=" w-80% bg-background-100 shadow-xl pt-6">
          <Box className="mb-5 px-4">
            <Text size="3xl" className="font-bold uppercase text-center mb-3">
              Achievements for {gameName}
            </Text>

            <AchievementsProgressBar
              unlockedCount={unlockedCount}
              totalCount={totalCount}
              completionPercent={completionPercent}
            />
          </Box>

          <VStack className="mb-4 px-4 pt-4">
            {mergedAchievements.map((item, index) => (
              <AchievementItem
                key={index}
                name={item.name}
                displayName={item.displayName}
                percentage={item.percent}
                unlockTime={item.unlockTime}
                description={item.description}
              />
            ))}
          </VStack>
        </Box>
      </ScrollablePage>
    </>
  );

  return (
    <Box className="flex-1 relative">
      {content}
      {/* Outside the state branches, so it is there while loading and on error too. */}
      <BackButton onPress={() => navigation.goBack()} testID="achievements-back" />
    </Box>
  );
};

export default AchievementsListView;
