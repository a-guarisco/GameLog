import { useGetBannerHeight } from '@gamelog/utils/bannerUtils';
import { useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUR_FADE_DISTANCE = 40;

const useTopNotchBlurOverlay = (minBannerHeight: number, bannerHeightScreenRatio: number) => {
  const insets = useSafeAreaInsets();
  const scrollBlurTargetRef = useRef<View | null>(null);

  const bannerHeight = useGetBannerHeight(minBannerHeight, bannerHeightScreenRatio);
  const blurThreshold = bannerHeight - insets.top;

  const scrollY = useRef(new Animated.Value(0)).current;
  const notchBlurOpacity = scrollY.interpolate({
    inputRange: [Math.max(blurThreshold - BLUR_FADE_DISTANCE, 0), blurThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false, // BlurView/BlurTargetView aren't native-driver friendly
  });

  return { bannerHeight, insetsTop: insets.top, notchBlurOpacity, onScroll, scrollBlurTargetRef };
};

export default useTopNotchBlurOverlay;
