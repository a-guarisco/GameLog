import { render, fireEvent } from '@testing-library/react-native';
import { GLGoogleButton, GoogleGIcon } from '../../src/onboarding/GLGoogleButton';

// Mock nativewind colorScheme hook
jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
  cssInterop: jest.fn(),
}));

describe('GLGoogleButton', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<GLGoogleButton />);
    expect(getByTestId('gl-google-button')).toBeTruthy();
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('handles onPress', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GLGoogleButton onPress={onPressMock} />);

    fireEvent.press(getByTestId('gl-google-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state correctly', () => {
    const { getByTestId, queryByTestId } = render(<GLGoogleButton isLoading />);
    // Pressable should be disabled
    const button = getByTestId('gl-google-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    // GoogleGIcon is not easily queryable without testID, but ActivityIndicator should replace it.
  });

  it('renders disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GLGoogleButton isDisabled onPress={onPressMock} />);

    const button = getByTestId('gl-google-button');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies dark mode styles correctly', () => {
    const { useColorScheme } = require('nativewind');
    useColorScheme.mockReturnValueOnce({ colorScheme: 'dark' });

    const { getByTestId } = render(<GLGoogleButton />);
    const button = getByTestId('gl-google-button');
    // We check for the class that implies dark mode styling
    expect(button.props.className).toContain('bg-[#131314]');
  });
});

describe('GoogleGIcon', () => {
  it('renders the SVG', () => {
    const { toJSON } = render(<GoogleGIcon size={30} />);
    expect(toJSON()).toBeTruthy();
  });
});
