import { useWindowDimensions } from 'react-native';

const useGetBannerHeight = (MIN_BANNER_HEIGHT: number, BANNER_HEIGHT_SCREEN_RATIO: number) => {
  const { height: screenHeight } = useWindowDimensions();
  return Math.max(screenHeight * BANNER_HEIGHT_SCREEN_RATIO, MIN_BANNER_HEIGHT);
};

export default useGetBannerHeight;
