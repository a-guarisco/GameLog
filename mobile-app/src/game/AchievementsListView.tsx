import { GlobalAchievement } from '@gamelog/api-manager/dto';
import { useMemo, useRef } from 'react';
import { Animated, useWindowDimensions, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AchievementItem from '@gamelog/game/AchievementItem';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Box } from '@gamelog/common/gluestack/box';
import { LoadingBox, ErrorBox } from '@gamelog/common/feedbacks';
import { useGetPlayerAchievementsPerApp } from '@gamelog/api-manager/useApi';
import GameBanner from './GameBanner';
import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { BlurView, BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type AchievementsListViewProps = {
  globalAchievements: GlobalAchievement;
  gameID: string;
  playerID: string;
};

const AchievementsListView = ({ route }: any) => {
  const isDark = useColorScheme() === 'dark';

  const { globalAchievements, gameID, playerID } = route.params as AchievementsListViewProps;

  const { personalAchievements, isLoadingPlayerAchievement, errorPlayerAchievement } =
    useGetPlayerAchievementsPerApp(gameID, playerID);

  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bannerHeight = Math.max((screenHeight * 18) / 100, 140);

  const blurThreshold = bannerHeight - insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;
  const notchBlurOpacity = scrollY.interpolate({
    inputRange: [Math.max(blurThreshold - 40, 0), blurThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const scrollBlurTargetRef = useRef<View | null>(null);

  const mergedAchievements = useMemo(() => {
    if (!isLoadingPlayerAchievement && !globalAchievements?.achievementpercentages?.achievements) {
      return [];
    }
    const personalList = personalAchievements?.playerstats?.achievements || [];
    const personalMap = new Map(personalList.map((ach) => [ach.apiname, ach]));

    return globalAchievements.achievementpercentages.achievements
      .map((globalAch) => {
        const personalAch = personalMap.get(globalAch.name);
        const isUnlocked = personalAch?.achieved === 1;

        return {
          name: globalAch.name,
          displayName: globalAch.displayName,
          percent: globalAch.percent,
          description: globalAch.description,
          unlockTime: isUnlocked ? personalAch.unlocktime : undefined,
        };
      })
      .sort((a, b) => {
        if (!!a.unlockTime !== !!b.unlockTime) return a.unlockTime ? -1 : 1;
        return a.percent - b.percent;
      });
  }, [globalAchievements, personalAchievements, isLoadingPlayerAchievement]);

  const streak = 19;
  const unlockedCount = mergedAchievements.filter((a) => a.unlockTime).length;
  const totalCount = mergedAchievements.length;
  const completionPercent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const gameName = personalAchievements?.playerstats?.gameName ?? 'Unknown Game';
  const gameCapsuleImage = steamAssetUrls.getGameCapsuleImage(gameID);
  const gameHeaderImage = steamAssetUrls.getGameHeaderImage(gameID);
  const secondaryText = streak > 0 ? `🔥 ${streak} day streak` : '0 day streak';

  return isLoadingPlayerAchievement ? (
    <LoadingBox className="flex-1 shadow-xl" message="Loading achievements..." />
  ) : errorPlayerAchievement ? (
    <ErrorBox
      className="flex-1"
      errorMessage="Failed to load achievements, please try again later."
    />
  ) : (
    <Box className="flex-1 relative">
      <GameBanner appid={gameID} title={gameName} streak={0} />

      <BlurTargetView ref={scrollBlurTargetRef} className="absolute inset-0 z-40">
        <Animated.ScrollView
          contentContainerStyle={{
            paddingTop: bannerHeight,
            paddingHorizontal: 0,
            paddingBottom: 24,
          }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false } // BlurView/BlurTargetView aren't native-driver friendly
          )}
        >
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
        </Animated.ScrollView>
      </BlurTargetView>

      <MaskedView
        pointerEvents="none"
        maskElement={
          <LinearGradient
            colors={['black', 'black', 'transparent']}
            locations={[0, 0.65, 1]}
            style={{ flex: 1 }}
          />
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 16,
          zIndex: 50,
          elevation: 50,
        }}
      >
        <AnimatedBlurView
          blurTarget={scrollBlurTargetRef}
          blurMethod="dimezisBlurView"
          pointerEvents="none"
          intensity={10}
          tint={isDark ? 'dark' : 'light'}
          style={{
            flex: 1,
            opacity: notchBlurOpacity,
          }}
        />
      </MaskedView>
    </Box>
  );
};

export default AchievementsListView;
