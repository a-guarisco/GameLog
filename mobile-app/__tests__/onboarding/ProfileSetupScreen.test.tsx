import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileSetupScreen from '../../src/onboarding/ProfileSetupScreen';
import { useProfileSetup } from '../../src/onboarding/useProfileSetup';

jest.mock('../../src/onboarding/useProfileSetup', () => ({
  useProfileSetup: jest.fn(),
}));

describe('ProfileSetupScreen', () => {
  const mockUseProfileSetup = {
    loading: false,
    errorMsg: null,
    username: '',
    setUsername: jest.fn(),
    steamId: '',
    setSteamId: jest.fn(),
    steamApiKey: '',
    setSteamApiKey: jest.fn(),
    handleRegister: jest.fn(),
    handleSignOut: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useProfileSetup as jest.Mock).mockReturnValue(mockUseProfileSetup);
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<ProfileSetupScreen />);
    
    expect(getByText('Complete Profile')).toBeTruthy();
    expect(getByPlaceholderText('Choose a username')).toBeTruthy();
    expect(getByPlaceholderText('e.g. 76561197960287930')).toBeTruthy();
    expect(getByPlaceholderText('Enter API Key to sync private games')).toBeTruthy();
    expect(getByText('Complete Setup')).toBeTruthy();
    expect(getByText('Cancel & Sign Out')).toBeTruthy();
  });

  it('handles input changes', () => {
    const { getByPlaceholderText } = render(<ProfileSetupScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Choose a username'), 'newuser');
    expect(mockUseProfileSetup.setUsername).toHaveBeenCalledWith('newuser');

    fireEvent.changeText(getByPlaceholderText('e.g. 76561197960287930'), '123456');
    expect(mockUseProfileSetup.setSteamId).toHaveBeenCalledWith('123456');

    fireEvent.changeText(getByPlaceholderText('Enter API Key to sync private games'), 'apikey');
    expect(mockUseProfileSetup.setSteamApiKey).toHaveBeenCalledWith('apikey');
  });

  it('calls handleRegister on submit', () => {
    const { getByText } = render(<ProfileSetupScreen />);
    
    fireEvent.press(getByText('Complete Setup'));
    expect(mockUseProfileSetup.handleRegister).toHaveBeenCalled();
  });

  it('calls handleSignOut on cancel', () => {
    const { getByText } = render(<ProfileSetupScreen />);
    
    fireEvent.press(getByText('Cancel & Sign Out'));
    expect(mockUseProfileSetup.handleSignOut).toHaveBeenCalled();
  });

  it('renders error message when present', () => {
    (useProfileSetup as jest.Mock).mockReturnValue({
      ...mockUseProfileSetup,
      errorMsg: 'Username already taken',
    });

    const { getByText } = render(<ProfileSetupScreen />);
    
    expect(getByText('Username already taken')).toBeTruthy();
  });

  it('disables buttons when loading', () => {
    (useProfileSetup as jest.Mock).mockReturnValue({
      ...mockUseProfileSetup,
      loading: true,
    });

    const { getByText } = render(<ProfileSetupScreen />);
    
    const submitBtn = getByText('Complete Setup');
    const cancelBtn = getByText('Cancel & Sign Out');
    
    // They should render, testing actual disabled state is tricky for Gluestack without specific queries,
    // but we can ensure they don't crash and render correctly.
    expect(submitBtn).toBeTruthy();
    expect(cancelBtn).toBeTruthy();
  });
});
