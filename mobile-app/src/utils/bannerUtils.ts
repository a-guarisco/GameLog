import { useWindowDimensions } from 'react-native';

const useGetBannerHeight = (MIN_BANNER_HEIGHT: number, BANNER_HEIGHT_SCREEN_RATIO: number) => {
  const { height: screenHeight } = useWindowDimensions();
  return Math.max(screenHeight * BANNER_HEIGHT_SCREEN_RATIO, MIN_BANNER_HEIGHT);
};

const getDefaultBannerParams = (isTablet = false) => {
  const MIN_BANNER_HEIGHT = isTablet ? 260 : 140;
  const BANNER_HEIGHT_SCREEN_RATIO = isTablet ? 0.26 : 0.18;
  return { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO };
};

export { getDefaultBannerParams, useGetBannerHeight };
