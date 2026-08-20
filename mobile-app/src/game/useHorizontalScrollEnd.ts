import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const DEFAULT_END_REACHED_THRESHOLD = 240;

export const useHorizontalScrollEnd = (
  onEndReached?: () => void,
  threshold: number = DEFAULT_END_REACHED_THRESHOLD
) => {
  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onEndReached) return;
    const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
    const distanceToEnd = contentSize.width - (contentOffset.x + layoutMeasurement.width);
    if (distanceToEnd <= threshold) {
      onEndReached();
    }
  };

  return { handleScroll };
};

export default useHorizontalScrollEnd;
