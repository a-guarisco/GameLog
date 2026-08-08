import { Animated, useColorScheme } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import GlobalAchievementsPreview from '@gamelog/game/GlobalAchievementsPreview';
import { Box } from '@gamelog/common/gluestack/box';
import { useRoute } from '@react-navigation/native';
import HeaderGameImage from '@gamelog/game/HeaderGameImage';
import useTopNotchBlurOverlay from '@gamelog/common/useTopNotchBlurOverlay';
import TopNotchBlurOverlay from '@gamelog/common/TopNotchBlurOverlay';
import BannerInfo from '@gamelog/common/BannerInfo';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { getDefaultBannerParams } from '@gamelog/utils/bannerUtils';
const GameView = () => {
  const route = useRoute<any>();
  const { gameItem } = route.params;
  const playerID = '76561198077919169'; //FIX
  const gameCapsuleImage = steamAssetUrls.getGameCapsuleImage(gameItem.appid);
  const secondaryText = gameItem.streak > 0 ? `🔥 ${gameItem.streak} day streak` : '0 day streak';
  const isDark = useColorScheme() === 'dark';
  const { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO } = getDefaultBannerParams();

  const { bannerHeight, insetsTop, notchBlurOpacity, onScroll, scrollBlurTargetRef } =
    useTopNotchBlurOverlay(MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO);
  console.log(gameItem);
  return (
    <Box className="flex-1 relative">
      <HeaderGameImage appid={gameItem.appid} />

      <BlurTargetView ref={scrollBlurTargetRef} className="absolute inset-0 z-40">
        <Animated.ScrollView
          contentContainerStyle={{
            paddingTop: bannerHeight,
            paddingHorizontal: 0,
            paddingBottom: 24,
          }}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          <BannerInfo
            className="bg-background-100 shadow-xl"
            title={gameItem.name}
            iconUrl={gameCapsuleImage}
            secondaryText={secondaryText}
          />
          <Box className="items-center justify-start px-4 pt-4">
            <GlobalAchievementsPreview
              gameID={gameItem.appid}
              playerID={playerID}
              gameItem={gameItem}
            />
          </Box>
        </Animated.ScrollView>
      </BlurTargetView>

      <TopNotchBlurOverlay
        blurTargetRef={scrollBlurTargetRef}
        height={insetsTop}
        opacity={notchBlurOpacity}
        isDark={isDark}
      />
    </Box>
  );
};

export default GameView;
