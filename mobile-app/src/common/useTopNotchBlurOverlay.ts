import { useRef } from 'react';
import { Animated, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_BANNER_HEIGHT = 140;
const BANNER_HEIGHT_SCREEN_RATIO = 0.18;
const BLUR_FADE_DISTANCE = 40;

const useTopNotchBlurOverlay = () => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollBlurTargetRef = useRef<View | null>(null);

  const bannerHeight = Math.max(screenHeight * BANNER_HEIGHT_SCREEN_RATIO, MIN_BANNER_HEIGHT);
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
