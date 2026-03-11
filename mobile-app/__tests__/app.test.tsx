import { render } from '@testing-library/react-native';
import { useFonts } from '@expo-google-fonts/dm-sans';
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
});
