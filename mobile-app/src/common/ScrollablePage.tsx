import useTopNotchBlurOverlay from '@gamelog/common/useTopNotchBlurOverlay';
import { getDefaultBannerParams } from '@gamelog/utils/bannerUtils';
import { BlurTargetView } from 'expo-blur';
import { Box } from './gluestack/box';
import TopNotchBlurOverlay from './TopNotchBlurOverlay';
import { Animated, useColorScheme } from 'react-native';

type ScrollablePageProps = {
  children: React.ReactNode;
};

const ScrollablePage = ({ children }: ScrollablePageProps) => {
  const isDark = useColorScheme() === 'dark';
  const { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO } = getDefaultBannerParams();
  const { bannerHeight, insetsTop, notchBlurOpacity, onScroll, scrollBlurTargetRef } =
    useTopNotchBlurOverlay(MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO);

  return (
    <Box className="flex-1 relative">
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
          {children}
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

export default ScrollablePage;
