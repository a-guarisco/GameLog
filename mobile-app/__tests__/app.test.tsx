import { render, screen } from '@testing-library/react-native';
import { useFonts } from '@expo-google-fonts/dm-sans';
import * as ReactNative from 'react-native';
import { lightTheme, darkTheme } from '../src/theme';
import App from '../App';

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
    const welcomeText = await screen.findByTestId('welcome-message');

    expect(welcomeText).toBeTruthy();
  });
});

describe('Theme Integration', () => {
  let themeSpy: jest.SpyInstance;

  beforeEach(() => {
    themeSpy = jest.spyOn(ReactNative, 'useColorScheme');
  });

  afterEach(() => {
    themeSpy.mockRestore();
  });

  test('apply darkTheme', async () => {
    themeSpy.mockReturnValue('dark');

    render(<App />);
    const text = await screen.findByTestId('welcome-message');

    expect(text.props.style).toMatchObject({ color: darkTheme.colors.text });
  });

  test('apply lightTheme', async () => {
    themeSpy.mockReturnValue('light');

    render(<App />);
    const text = await screen.findByTestId('welcome-message');

    expect(text.props.style).toMatchObject({ color: lightTheme.colors.text });
  });
});
