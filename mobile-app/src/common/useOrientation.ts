import { useWindowDimensions } from 'react-native';

/**
 * Returns `true` when the device is in landscape (width >= height).
 * Re-evaluates automatically on every rotation because `useWindowDimensions`
 * is reactive to window-size changes.
 */
export const useOrientation = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width >= height;
  const isTablet = Math.min(width, height) >= 600;
  return { isLandscape, isTablet, width, height };
};
