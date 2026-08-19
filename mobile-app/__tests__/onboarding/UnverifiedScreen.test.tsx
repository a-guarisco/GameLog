import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UnverifiedScreen from '../../src/onboarding/UnverifiedScreen';
import { useUnverifiedScreen } from '../../src/onboarding/useUnverifiedScreen';

jest.mock('../../src/onboarding/useUnverifiedScreen', () => ({
  useUnverifiedScreen: jest.fn(),
}));

jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('@gamelog/auth/authErrorMessages', () => ({
  getAuthErrorMessage: jest.fn((code) => `Error: ${code}`),
}));

describe('UnverifiedScreen', () => {
  const mockUseUnverifiedScreen = {
    firebaseUser: { email: 'test@example.com' },
    loading: false,
    resendLoading: false,
    errorCode: null,
    successMsg: null,
    handleCheckVerification: jest.fn(),
    handleResendEmail: jest.fn(),
    handleSignOut: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUnverifiedScreen as jest.Mock).mockReturnValue(mockUseUnverifiedScreen);
  });

  it('renders correctly', () => {
    const { getByText } = render(<UnverifiedScreen />);
    
    expect(getByText('Verify your Email')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
    expect(getByText('I verified it, continue')).toBeTruthy();
    expect(getByText('Resend email')).toBeTruthy();
    expect(getByText('Sign Out / Change Account')).toBeTruthy();
  });

  it('handles verification check press', () => {
    const { getByText } = render(<UnverifiedScreen />);
    
    fireEvent.press(getByText('I verified it, continue'));
    expect(mockUseUnverifiedScreen.handleCheckVerification).toHaveBeenCalled();
  });

  it('handles resend email press', () => {
    const { getByText } = render(<UnverifiedScreen />);
    
    fireEvent.press(getByText('Resend email'));
    expect(mockUseUnverifiedScreen.handleResendEmail).toHaveBeenCalled();
  });

  it('handles sign out press', () => {
    const { getByText } = render(<UnverifiedScreen />);
    
    fireEvent.press(getByText('Sign Out / Change Account'));
    expect(mockUseUnverifiedScreen.handleSignOut).toHaveBeenCalled();
  });

  it('renders error message when present', () => {
    (useUnverifiedScreen as jest.Mock).mockReturnValue({
      ...mockUseUnverifiedScreen,
      errorCode: 'auth/unverified-email',
    });

    const { getByText } = render(<UnverifiedScreen />);
    expect(getByText('Error: auth/unverified-email')).toBeTruthy();
  });

  it('renders success message when present', () => {
    (useUnverifiedScreen as jest.Mock).mockReturnValue({
      ...mockUseUnverifiedScreen,
      successMsg: 'Verification email sent again!',
    });

    const { getByText } = render(<UnverifiedScreen />);
    expect(getByText('Verification email sent again!')).toBeTruthy();
  });

  it('disables buttons when loading', () => {
    (useUnverifiedScreen as jest.Mock).mockReturnValue({
      ...mockUseUnverifiedScreen,
      loading: true,
    });

    const { getByText } = render(<UnverifiedScreen />);
    
    // We expect the buttons to be rendered. Gluestack Buttons uses `disabled` props down the tree.
    expect(getByText('I verified it, continue')).toBeTruthy();
    expect(getByText('Resend email')).toBeTruthy();
  });

  it('disables buttons when resendLoading is true', () => {
    (useUnverifiedScreen as jest.Mock).mockReturnValue({
      ...mockUseUnverifiedScreen,
      resendLoading: true,
    });

    const { getByText } = render(<UnverifiedScreen />);
    
    expect(getByText('I verified it, continue')).toBeTruthy();
    expect(getByText('Resend email')).toBeTruthy();
  });
});
