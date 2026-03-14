import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { darkTheme, lightTheme, getNavigationTheme } from './src//theme/theme';
import { createStaticNavigation } from '@react-navigation/native';
import useAppInit from './src/hooks/useAppInit';
import { RootTabs } from './src/routes';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  const deviceTheme = useColorScheme();
  const isDarkMode = deviceTheme === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = getNavigationTheme(isDarkMode);
  const { isReady } = useAppInit();

  const Navigation = createStaticNavigation(RootTabs);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar style="auto" />
        <Navigation theme={navTheme} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
