import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import { View, Text, Appearance } from 'react-native';
import { darkTheme, lightTheme } from '../../src/theme/theme';

export const commonGLMocks = {
  ViewGL: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  TextGL: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
};

const deviceTheme = Appearance.getColorScheme();
const theme = deviceTheme === 'dark' ? darkTheme : lightTheme;

export const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
