import {
  useFonts,
  DMSans_100Thin,
  DMSans_200ExtraLight,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';

import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

const useAppInit = () => {
  const [fontsLoaded] = useFonts({
    'DMSans-Thin': DMSans_100Thin,
    'DMSans-ExtraLight': DMSans_200ExtraLight,
    'DMSans-Light': DMSans_300Light,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Italic': DMSans_400Regular_Italic,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'DMSans-Heavy': DMSans_800ExtraBold,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
  });

  //NOTE other initialization logic can go here
  // (e.g., loading user settings, initializing analytics, etc.)

  return {
    isReady: fontsLoaded,
  };
};

export default useAppInit;
