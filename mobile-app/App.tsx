import { useMemo, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { createStaticNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { DeviceEventEmitter } from 'react-native';

import '@gamelog/theme/global.css';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';
import { getNavigationTheme } from '@gamelog/theme/themeHelpers';
import useAppInit from '@gamelog/common/useAppInit';
import { RootTabs, AuthNavigator, OnboardingNavigator, UnverifiedNavigator } from '@gamelog/routes';
import SplashScreen from '@gamelog/onboarding/SplashScreen';
import { useAuthSession } from '@gamelog/auth/useAuthSession';

const MainNavigation = createStaticNavigation(RootTabs);
const AuthNavigation = createStaticNavigation(AuthNavigator);
const OnboardingNavigation = createStaticNavigation(OnboardingNavigator);
const UnverifiedNavigation = createStaticNavigation(UnverifiedNavigator);

const App = () => {
  const { isReady } = useAppInit();
  const { authState, refreshBackendUser } = useAuthSession();

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navTheme = useMemo(() => getNavigationTheme(isDarkMode), [isDarkMode]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('registrationSuccess', () => {
      refreshBackendUser();
    });
    return () => sub.remove();
  }, [refreshBackendUser]);

  if (!isReady || authState === 'loading') {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider mode={colorScheme ?? 'light'}>
          <SplashScreen />
        </GluestackUIProvider>
      </SafeAreaProvider>
    );
  }

  const currentMode = colorScheme ?? 'light';

  let NavigationToRender = MainNavigation;
  if (authState === 'unauthenticated') {
    NavigationToRender = AuthNavigation;
  } else if (authState === 'onboarding') {
    NavigationToRender = OnboardingNavigation;
  } else if (authState === 'unverified') {
    NavigationToRender = UnverifiedNavigation;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={currentMode}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <NavigationToRender theme={navTheme} />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
};

export default App;
