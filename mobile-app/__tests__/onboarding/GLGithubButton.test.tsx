import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GLGithubButton, GithubLogo } from '../../src/onboarding/GLGithubButton';

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
}));

describe('GLGithubButton', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<GLGithubButton />);
    expect(getByTestId('gl-github-button')).toBeTruthy();
    expect(getByText('Continue with GitHub')).toBeTruthy();
  });

  it('handles onPress', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GLGithubButton onPress={onPressMock} />);
    
    fireEvent.press(getByTestId('gl-github-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state correctly', () => {
    const { getByTestId } = render(<GLGithubButton isLoading />);
    const button = getByTestId('gl-github-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('renders disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GLGithubButton isDisabled onPress={onPressMock} />);
    
    const button = getByTestId('gl-github-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(button);
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies dark mode styles correctly', () => {
    const { useColorScheme } = require('nativewind');
    useColorScheme.mockReturnValueOnce({ colorScheme: 'dark' });
    
    const { getByTestId } = render(<GLGithubButton />);
    const button = getByTestId('gl-github-button');
    expect(button.props.className).toContain('bg-[#21262D]');
  });
});

describe('GithubLogo', () => {
  it('renders the SVG', () => {
    const { toJSON } = render(<GithubLogo size={30} />);
    expect(toJSON()).toBeTruthy();
  });
});
