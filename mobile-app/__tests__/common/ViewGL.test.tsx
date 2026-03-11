import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import { ViewGL } from '../../src/common';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../../src/theme/theme';

const deviceTheme = useColorScheme();
const theme = deviceTheme === 'dark' ? darkTheme : lightTheme;

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('ViewGL', () => {
  it('renders correctly', () => {
    const { getByTestId } = renderWithTheme(<ViewGL testID="view-gl" />);
    expect(getByTestId('view-gl')).toBeTruthy();
  });
});
