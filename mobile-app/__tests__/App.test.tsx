import { render } from '@testing-library/react-native';
import { useFonts } from '@expo-google-fonts/dm-sans';
import App from '../App';
import useAppInit from '@gamelog/common/useAppInit';
import { useAuthSession } from '@gamelog/auth/useAuthSession';

jest.mock('@gamelog/common/useAppInit');
jest.mock('@gamelog/auth/useAuthSession');
jest.mock('@gamelog/common/charts/total-hours/TotalHoursChart', () => () => null);
jest.mock('@gamelog/common/charts/total-hours/TotalHoursDoughnut', () => () => null);
jest.mock('@gamelog/common/charts/genre-radar/GameGenreRadarChart', () => () => null);

jest.mock('@gamelog/onboarding/SplashScreen', () => {
  const { Text } = require('react-native');
  return () => <Text testID="splash-screen">SplashScreen</Text>;
});

jest.mock('../src/common/gluestack/gluestack-ui-provider', () => ({
  GluestackUIProvider: ({ children }: any) => <>{children}</>,
}));

describe('App Initialization', () => {
  beforeEach(() => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    (useAppInit as jest.Mock).mockReturnValue({ isReady: false });
    (useAuthSession as jest.Mock).mockReturnValue({
      authState: 'loading',
      refreshBackendUser: jest.fn(),
    });
  });

  test('renders splash screen before initialization', async () => {
    (useFonts as jest.Mock).mockReturnValue([false]);

    const { getByTestId } = render(<App />);

    expect(getByTestId('splash-screen')).toBeTruthy();
  });
});
