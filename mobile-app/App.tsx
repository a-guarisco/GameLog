import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { darkTheme, lightTheme } from './src//theme/theme';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import useAppInit from './src/hooks/useAppInit';
import { RootTabs } from './src/routes';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStaticNavigation } from '@react-navigation/native';

const App = () => {
  const deviceTheme = useColorScheme();
  const theme = deviceTheme === 'dark' ? darkTheme : lightTheme;
  const navTheme = deviceTheme === 'dark' ? DarkTheme : DefaultTheme; // This is a problem that we have to talk about
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
