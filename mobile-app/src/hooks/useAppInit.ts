import {
  useFonts,
  DMSans_100Thin,
  DMSans_100Thin_Italic,
  DMSans_200ExtraLight,
  DMSans_200ExtraLight_Italic,
  DMSans_300Light,
  DMSans_300Light_Italic,
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_500Medium_Italic,
  DMSans_700Bold,
  DMSans_700Bold_Italic,
  DMSans_600SemiBold,
  DMSans_600SemiBold_Italic,
  DMSans_800ExtraBold,
  DMSans_800ExtraBold_Italic,
  DMSans_900Black,
  DMSans_900Black_Italic,
} from '@expo-google-fonts/dm-sans';

import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

const useAppInit = () => {
  const [fontsLoaded] = useFonts({
    'DMSans-Thin': DMSans_100Thin,
    'DMSans-ThinItalic': DMSans_100Thin_Italic,
    'DMSans-ExtraLight': DMSans_200ExtraLight,
    'DMSans-ExtraLightItalic': DMSans_200ExtraLight_Italic,
    'DMSans-Light': DMSans_300Light,
    'DMSans-LightItalic': DMSans_300Light_Italic,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-RegularItalic': DMSans_400Regular_Italic,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-MediumItalic': DMSans_500Medium_Italic,
    'DMSans-SemiBold': DMSans_600SemiBold,
    'DMSans-SemiBoldItalic': DMSans_600SemiBold_Italic,
    'DMSans-Bold': DMSans_700Bold,
    'DMSans-BoldItalic': DMSans_700Bold_Italic,
    'DMSans-ExtraBold': DMSans_800ExtraBold,
    'DMSans-ExtraBoldItalic': DMSans_800ExtraBold_Italic,
    'DMSans-Black': DMSans_900Black,
    'DMSans-BlackItalic': DMSans_900Black_Italic,

    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
  });

  //NOTE other initialization logic can go here
  // (e.g., loading user settings, initializing analytics, etc.)

  return {
    isReady: fontsLoaded,
  };
};

export default useAppInit;
