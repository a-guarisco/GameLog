import { useGetBannerHeight } from '@gamelog/utils/bannerUtils';
import { useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUR_FADE_DISTANCE = 40;

const useTopNotchBlurOverlay = (minBannerHeight: number, bannerHeightScreenRatio: number) => {
  const insets = useSafeAreaInsets();
  const scrollBlurTargetRef = useRef<View | null>(null);

  const calculatedBannerHeight = useGetBannerHeight(minBannerHeight, bannerHeightScreenRatio);
  const bannerHeight =
    minBannerHeight > 0 || bannerHeightScreenRatio > 0 ? calculatedBannerHeight : 0;
  const blurThreshold = bannerHeight > 0 ? bannerHeight - insets.top : 0;

  const scrollY = useRef(new Animated.Value(0)).current;
  const notchBlurOpacity = scrollY.interpolate({
    inputRange:
      bannerHeight > 0
        ? [Math.max(blurThreshold - BLUR_FADE_DISTANCE, 0), Math.max(blurThreshold, 0.01)]
        : [0, BLUR_FADE_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false, // BlurView/BlurTargetView aren't native-driver friendly
  });

  return { bannerHeight, insetsTop: insets.top, notchBlurOpacity, onScroll, scrollBlurTargetRef };
};

export default useTopNotchBlurOverlay;
