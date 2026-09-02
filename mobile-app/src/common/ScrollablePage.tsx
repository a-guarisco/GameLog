import useTopNotchBlurOverlay from '@gamelog/common/useTopNotchBlurOverlay';
import { getDefaultBannerParams } from '@gamelog/utils/bannerUtils';
import { BlurTargetView } from 'expo-blur';
import { Box } from './gluestack/box';
import TopNotchBlurOverlay from './TopNotchBlurOverlay';
import { Animated, useColorScheme } from 'react-native';

type ScrollablePageProps = {
  children: React.ReactNode;
  hasBanner?: boolean;
  contentPaddingTop?: number;
};

const ScrollablePage = ({
  children,
  hasBanner = true,
  contentPaddingTop,
}: ScrollablePageProps) => {
  const isDark = useColorScheme() === 'dark';
  const { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO } = getDefaultBannerParams();
  const { bannerHeight, insetsTop, notchBlurOpacity, onScroll, scrollBlurTargetRef } =
    useTopNotchBlurOverlay(
      hasBanner ? MIN_BANNER_HEIGHT : 0,
      hasBanner ? BANNER_HEIGHT_SCREEN_RATIO : 0
    );

  const paddingTop = contentPaddingTop ?? (hasBanner ? bannerHeight : insetsTop + 16);

  return (
    <Box className="flex-1 relative">
      <BlurTargetView ref={scrollBlurTargetRef} className="absolute inset-0 z-40">
        <Animated.ScrollView
          contentContainerStyle={{
            paddingTop,
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
