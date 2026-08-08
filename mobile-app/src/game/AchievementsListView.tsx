import { GlobalAchievement } from '@gamelog/api-manager/dto';
import AchievementItem from '@gamelog/game/AchievementItem';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox, ErrorBox } from '@gamelog/common/feedbacks';
import HeaderGameImage from './HeaderGameImage';
import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import useAchievementsData from './useAchievementsData';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import AchievementsProgressBar from './AchievementsProgressBar';

type AchievementsListViewProps = {
  globalAchievements: GlobalAchievement;
  gameID: string;
  playerID: string;
};

const AchievementsListView = ({ route }: any) => {
  const { globalAchievements, gameID, playerID } = route.params as AchievementsListViewProps;
  const streak = 19;

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
  const secondaryText = streak > 0 ? `🔥 ${streak} day streak` : '0 day streak';

  return isLoading ? (
    <LoadingBox className="flex-1 shadow-xl" message="Loading achievements..." />
  ) : error ? (
    <ErrorBox
      className="flex-1"
      errorMessage="Failed to load achievements, please try again later."
    />
  ) : (
    <Box className="flex-1 relative">
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
    </Box>
  );
};

export default AchievementsListView;
