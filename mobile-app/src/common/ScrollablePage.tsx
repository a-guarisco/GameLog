import useTopNotchBlurOverlay from '@gamelog/common/useTopNotchBlurOverlay';
import { getDefaultBannerParams } from '@gamelog/utils/bannerUtils';
import { BlurTargetView } from 'expo-blur';
import { Box } from './gluestack/box';
import TopNotchBlurOverlay from './TopNotchBlurOverlay';
import { Animated, useColorScheme } from 'react-native';
import GLRefreshControl from './GLRefreshControl';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNavRailOffset } from './navConstants';

type ScrollablePageProps = {
  children: React.ReactNode;
  hasBanner?: boolean;
  contentPaddingTop?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const ScrollablePage = ({
  children,
  hasBanner = true,
  contentPaddingTop,
  refreshing,
  onRefresh,
}: ScrollablePageProps) => {
  const isDark = useColorScheme() === 'dark';
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO } = getDefaultBannerParams(isTablet);
  const { bannerHeight, insetsTop, notchBlurOpacity, onScroll, scrollBlurTargetRef } =
    useTopNotchBlurOverlay(
      hasBanner ? MIN_BANNER_HEIGHT : 0,
      hasBanner ? BANNER_HEIGHT_SCREEN_RATIO : 0
    );

  const paddingTop = contentPaddingTop ?? (hasBanner ? bannerHeight : insetsTop + 16);
  const leftPadding = getNavRailOffset({ isLandscape, isTablet, insetsLeft: insets.left });

  const isScrollableBanner = (isLandscape || isTablet) && hasBanner;

  return (
    <Box
      className="flex-1 relative"
      style={{ paddingLeft: leftPadding }}
      pointerEvents={isScrollableBanner ? 'box-none' : 'auto'}
    >
      <BlurTargetView
        ref={scrollBlurTargetRef}
        className="absolute inset-0 z-40"
        pointerEvents={isScrollableBanner ? 'box-none' : 'auto'}
      >
        <Animated.ScrollView
          testID="scrollable-page-scroll"
          contentContainerStyle={{
            paddingTop,
            paddingHorizontal: 0,
            paddingBottom: 24,
          }}
          scrollEventThrottle={16}
          onScroll={onScroll}
          pointerEvents={isScrollableBanner ? 'box-none' : 'auto'}
          refreshControl={
            onRefresh ? (
              <GLRefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {isScrollableBanner ? <Box pointerEvents="auto">{children}</Box> : children}
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
