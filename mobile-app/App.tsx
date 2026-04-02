import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { createStaticNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import '@gamelog/theme/global.css';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';
import { getNavigationTheme } from '@gamelog/theme/themeHelpers';
import useAppInit from '@gamelog/hooks/useAppInit';
import { RootTabs } from '@gamelog/routes';

const Navigation = createStaticNavigation(RootTabs);

const App = () => {
  const { isReady } = useAppInit();

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navTheme = useMemo(() => getNavigationTheme(isDarkMode), [isDarkMode]);

  if (!isReady) {
    return null;
  }
  const currentMode = colorScheme ?? 'light';

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={currentMode}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Navigation theme={navTheme} />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
};

export default App;
