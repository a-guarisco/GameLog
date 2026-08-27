import { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useChartScrollShimmer = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (isScrolling) {
      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => {
        loop.stop();
        shimmerAnim.setValue(-1);
      };
    }
  }, [isScrolling, shimmerAnim]);

  return { isScrolling, setIsScrolling, shimmerAnim };
};
