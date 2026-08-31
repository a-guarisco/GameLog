import { useEffect } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionCard from '@gamelog/common/SectionCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface SkeletonCardProps {
  height?: number;
}

const SkeletonCard = ({ height = 200 }: SkeletonCardProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SectionCard>
      <VStack space="md" className="w-full">
        {/* Fake title */}
        <Animated.View style={animatedStyle}>
          <Box className="w-1/3 h-5 bg-background-300 rounded-md" />
        </Animated.View>
        {/* Fake content */}
        <Animated.View style={animatedStyle}>
          <Box className="w-full bg-background-200 rounded-md" style={{ height }} />
        </Animated.View>
      </VStack>
    </SectionCard>
  );
};

export default SkeletonCard;
