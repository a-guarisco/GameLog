import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import '@gamelog/theme/global.css';
import { getNavigationTheme } from '@gamelog/theme/theme';
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

  return (
    <SafeAreaProvider>
      <View className={`flex-1 ${colorScheme}`} key={colorScheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Navigation theme={navTheme} />
      </View>
    </SafeAreaProvider>
  );
};

export default App;
