import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { darkTheme, lightTheme } from './src//theme/theme';
import useAppInit from './src/hooks/useAppInit';
import { ViewGL, TextGL } from './src/components/common/';

const App = () => {
  const deviceTheme = useColorScheme();
  const theme = deviceTheme === 'dark' ? darkTheme : lightTheme;
  const { isReady } = useAppInit();
  if (!isReady) {
    return null;
  }
  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="auto" />
      <ViewGL>
        <TextGL>Welcome to GameLog!</TextGL>
      </ViewGL>
    </ThemeProvider>
  );
};

export default App;
