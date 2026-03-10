import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { darkTheme, lightTheme } from './src//theme/theme';
import useAppInit from './src/hooks/useAppInit';
import { RootTabs } from './src/routes';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStaticNavigation } from '@react-navigation/native';

const App = () => {
  const deviceTheme = useColorScheme();
  const theme = deviceTheme === 'dark' ? darkTheme : lightTheme;
  const { isReady } = useAppInit();
  
  const Navigation = createStaticNavigation(RootTabs)

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
      <StatusBar style="auto" />
        <Navigation theme={theme}/>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
