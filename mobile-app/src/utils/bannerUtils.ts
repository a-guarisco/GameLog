import { useWindowDimensions } from 'react-native';

const useGetBannerHeight = (MIN_BANNER_HEIGHT: number, BANNER_HEIGHT_SCREEN_RATIO: number) => {
  const { height: screenHeight } = useWindowDimensions();
  return Math.max(screenHeight * BANNER_HEIGHT_SCREEN_RATIO, MIN_BANNER_HEIGHT);
};

const getDefaultBannerParams = () => {
  const MIN_BANNER_HEIGHT = 140;
  const BANNER_HEIGHT_SCREEN_RATIO = 0.18;
  return { MIN_BANNER_HEIGHT, BANNER_HEIGHT_SCREEN_RATIO };
};

export { getDefaultBannerParams, useGetBannerHeight };
