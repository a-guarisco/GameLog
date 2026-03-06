import { render, screen } from '@testing-library/react-native';
import { useFonts } from '@expo-google-fonts/dm-sans';
import * as ReactNative from 'react-native';
import { lightTheme, darkTheme } from '../../theme/theme';
import App from '../../app/App';

let initText: RegExp = /GameLog/i;

describe('App Initialization', () => {
  beforeEach(() => {
    (useFonts as jest.Mock).mockReturnValue([true]);
  });

  test('renders nothing before initialization', async () => {
    (useFonts as jest.Mock).mockReturnValue([false]);

    const { toJSON } = render(<App />);

    expect(toJSON()).toBeNull();
  });

  test('renders welcome text after initialization', async () => {
    render(<App />);
    const welcomeText = await screen.findByText(initText);

    expect(welcomeText).toBeTruthy();
  });
});
