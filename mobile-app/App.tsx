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
import { useDeviceNotificationSync } from '@gamelog/notifications';

const MainNavigation = createStaticNavigation(RootTabs);
const AuthNavigation = createStaticNavigation(AuthNavigator);
const OnboardingNavigation = createStaticNavigation(OnboardingNavigator);
const UnverifiedNavigation = createStaticNavigation(UnverifiedNavigator);

const navigators: Record<string, React.ComponentType<any>> = {
  unauthenticated: AuthNavigation,
  onboarding: OnboardingNavigation,
  unverified: UnverifiedNavigation,
  authenticated: MainNavigation,
};

const AppContent = () => {
  const { authState, backendUser, refreshBackendUser } = useAuthSession();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navTheme = useMemo(() => getNavigationTheme(isDarkMode), [isDarkMode]);

  useDeviceNotificationSync(authState === 'authenticated' ? backendUser?.id : undefined);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('registrationSuccess', () => {
      refreshBackendUser();
    });
    return () => sub.remove();
  }, [refreshBackendUser]);

  if (authState === 'loading') {
    return <SplashScreen />;
  }

  const NavigationToRender = navigators[authState] || MainNavigation;

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationToRender theme={navTheme} />
    </>
  );
};

const App = () => {
  const { isReady } = useAppInit();
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={colorScheme ?? 'light'}>
        {!isReady ? <SplashScreen /> : <AppContent />}
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
};

export default App;
