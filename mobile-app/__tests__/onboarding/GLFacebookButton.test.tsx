import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GLFacebookButton, FacebookLogo } from '../../src/onboarding/GLFacebookButton';

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
}));

describe('GLFacebookButton', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<GLFacebookButton />);
    expect(getByTestId('gl-facebook-button')).toBeTruthy();
    expect(getByText('Continue with Facebook')).toBeTruthy();
  });

  it('handles onPress', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GLFacebookButton onPress={onPressMock} />);
    
    fireEvent.press(getByTestId('gl-facebook-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state correctly', () => {
    const { getByTestId } = render(<GLFacebookButton isLoading />);
    const button = getByTestId('gl-facebook-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('renders disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GLFacebookButton isDisabled onPress={onPressMock} />);
    
    const button = getByTestId('gl-facebook-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(button);
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies dark mode styles correctly', () => {
    const { useColorScheme } = require('nativewind');
    useColorScheme.mockReturnValueOnce({ colorScheme: 'dark' });
    
    const { getByTestId } = render(<GLFacebookButton />);
    const button = getByTestId('gl-facebook-button');
    expect(button.props.className).toContain('bg-[#1877F2]'); // Style is the same for both right now
  });
});

describe('FacebookLogo', () => {
  it('renders the SVG', () => {
    const { toJSON } = render(<FacebookLogo size={30} />);
    expect(toJSON()).toBeTruthy();
  });
});
