import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { darkTheme, lightTheme } from './src//theme';
import useAppInit from './src/hooks/useAppInit';
import * as S from './src/components/common/';

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
      <S.View>
        <S.Text testID="welcome-message">Open up App.tsx to start working on your app!</S.Text>
      </S.View>
    </ThemeProvider>
  );
};

export default App;
