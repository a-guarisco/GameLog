import { RefObject } from 'react';
import { Animated, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type TopNotchBlurOverlayProps = {
  blurTargetRef: RefObject<View | null>;
  height: number;
  opacity: Animated.AnimatedInterpolation<number>;
  isDark: boolean;
};

const TopNotchBlurOverlay = ({
  blurTargetRef,
  height,
  opacity,
  isDark,
}: TopNotchBlurOverlayProps) => (
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
      height,
      zIndex: 50,
      elevation: 50,
    }}
  >
    <AnimatedBlurView
      blurTarget={blurTargetRef}
      blurMethod="dimezisBlurView"
      pointerEvents="none"
      intensity={10}
      tint={isDark ? 'dark' : 'light'}
      style={{ flex: 1, opacity }}
    />
  </MaskedView>
);

export default TopNotchBlurOverlay;
