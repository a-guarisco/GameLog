import useGetBannerHeight from '@gamelog/utils/bannerUtils';
import { useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_BANNER_HEIGHT = 140;
const BANNER_HEIGHT_SCREEN_RATIO = 0.18;
const BLUR_FADE_DISTANCE = 40;

const useTopNotchBlurOverlay = () => {
  const insets = useSafeAreaInsets();
  const scrollBlurTargetRef = useRef<View | null>(null);

  const bannerHeight = useGetBannerHeight(MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO);
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
