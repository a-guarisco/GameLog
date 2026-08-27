import React from 'react';
import { render } from '@testing-library/react-native';
import SplashScreen from '../../src/onboarding/SplashScreen';

describe('SplashScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<SplashScreen />);
    expect(getByText('GameLog')).toBeTruthy();
  });
});
