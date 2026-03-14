import {
  useFonts,
  DMSans_400Regular,
  DMSans_700Bold,
  DMSans_300Light,
  DMSans_800ExtraBold,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';

const useAppInit = () => {
  const [fontsLoaded] = useFonts({
    'DMSans-Regular-400': DMSans_400Regular,
    'DMSans-Medium-500': DMSans_500Medium,
    'DMSans-Bold-700': DMSans_700Bold,
    'DMSans-Heavy-800': DMSans_800ExtraBold,
  });

  //NOTE other initialization logic can go here
  // (e.g., loading user settings, initializing analytics, etc.)

  return {
    isReady: fontsLoaded,
  };
};

export default useAppInit;
