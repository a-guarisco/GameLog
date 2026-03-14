import { useFonts, DMSans_400Regular, DMSans_700Bold, DMSans_300Light } from '@expo-google-fonts/dm-sans';

const useAppInit = () => {
  const [fontsLoaded] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Bold': DMSans_700Bold,
    'DMSans-Light': DMSans_300Light,
  });

  //NOTE other initialization logic can go here
  // (e.g., loading user settings, initializing analytics, etc.)

  return {
    isReady: fontsLoaded,
  };
};

export default useAppInit;
