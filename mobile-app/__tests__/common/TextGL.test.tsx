import { render } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import { TextGL } from '../../src/common';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../../src/theme/theme';

const deviceTheme = useColorScheme();
const theme = deviceTheme === 'dark' ? darkTheme : lightTheme;

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('TextGL', () => {
  it('renders with default props', () => {
    const { getByText } = renderWithTheme(<TextGL>Hello</TextGL>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders with size and variant props', () => {
    const { getByText } = renderWithTheme(
      <TextGL size="l" variant="bold">
        Big
      </TextGL>
    );
    expect(getByText('Big')).toBeTruthy();
  });
});
