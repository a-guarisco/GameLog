
import { render } from '@testing-library/react-native';
import SplashScreen from '../../src/onboarding/SplashScreen';

describe('SplashScreen', () => {
  it('renders correctly', () => {
    const { getByTestId, getByLabelText } = render(<SplashScreen />);
    expect(getByTestId('splash-logo')).toBeTruthy();
    expect(getByLabelText('GameLog')).toBeTruthy();
  });
});
