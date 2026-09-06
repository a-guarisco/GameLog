import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OptionsView } from '@gamelog/options/OptionsView';
import { signOut } from 'firebase/auth';
import { signOutGoogle } from '@gamelog/auth/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllSecureStorage } from '@gamelog/storage/secureStorage';
import { clearSteamApiKey } from '@gamelog/api-manager/steamApiKey';
import { useColorScheme } from 'nativewind';
import { useOrientation } from '@gamelog/common/useOrientation';

jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: jest.fn(),
}));

jest.mock('@gamelog/auth/googleAuth', () => ({
  signOutGoogle: jest.fn(() => Promise.resolve()),
}));

jest.mock('@gamelog/storage/secureStorage', () => ({
  clearAllSecureStorage: jest.fn(() => Promise.resolve()),
}));

jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  clearSteamApiKey: jest.fn(() => Promise.resolve()),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  getFirebaseAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id', email: 'test@example.com' },
  })),
}));

describe('OptionsView Component', () => {
  const mockSetColorScheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useColorScheme as jest.Mock).mockReturnValue({
      colorScheme: 'light',
      setColorScheme: mockSetColorScheme,
    });
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 400,
      height: 800,
    });
  });

  it('renders Header, Theme Mode card, and Account card', () => {
    const { getByText, getByTestId } = render(<OptionsView />);

    expect(getByText('Options')).toBeTruthy();
    expect(getByText('Theme Mode')).toBeTruthy();
    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Toggle Theme: Light')).toBeTruthy();
    expect(getByTestId('options-theme-toggle-btn')).toBeTruthy();
    expect(getByTestId('options-logout-btn')).toBeTruthy();
  });

  it('toggles theme when the theme button is pressed', () => {
    const { getByTestId } = render(<OptionsView />);
    const themeBtn = getByTestId('options-theme-toggle-btn');

    fireEvent.press(themeBtn);
    expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
  });

  it('renders flat style outline theme icon with text color (sunny-outline for light, moon-outline for dark)', () => {
    const { getByTestId, rerender } = render(<OptionsView />);
    const themeBtn = getByTestId('options-theme-toggle-btn');
    const lightIcon = themeBtn.findByProps({ name: 'sunny-outline' });
    expect(lightIcon).toBeTruthy();
    expect(lightIcon.props.color).toBe('#09090b');

    (useColorScheme as jest.Mock).mockReturnValue({
      colorScheme: 'dark',
      setColorScheme: mockSetColorScheme,
    });

    rerender(<OptionsView />);
    const darkThemeBtn = getByTestId('options-theme-toggle-btn');
    const darkIcon = darkThemeBtn.findByProps({ name: 'moon-outline' });
    expect(darkIcon).toBeTruthy();
    expect(darkIcon.props.color).toBe('#ffffff');
  });

  it('opens confirmation modal when Log Out button is pressed', () => {
    const { getByTestId, getByText } = render(<OptionsView />);
    const logoutBtn = getByTestId('options-logout-btn');

    fireEvent.press(logoutBtn);

    expect(getByText('Are you sure you want to log out?')).toBeTruthy();
    expect(getByTestId('options-logout-confirm-btn')).toBeTruthy();
    expect(getByTestId('options-logout-cancel-btn')).toBeTruthy();
  });

  it('dismisses modal without logging out when Cancel is pressed', () => {
    const { getByTestId } = render(<OptionsView />);
    const logoutBtn = getByTestId('options-logout-btn');

    fireEvent.press(logoutBtn);
    const cancelBtn = getByTestId('options-logout-cancel-btn');
    fireEvent.press(cancelBtn);

    expect(signOut).not.toHaveBeenCalled();
    expect(signOutGoogle).not.toHaveBeenCalled();
    expect(AsyncStorage.clear).not.toHaveBeenCalled();
  });

  it('performs full clean sign-out when confirmed in modal', async () => {
    const { getByTestId } = render(<OptionsView />);
    const logoutBtn = getByTestId('options-logout-btn');

    fireEvent.press(logoutBtn);
    const confirmBtn = getByTestId('options-logout-confirm-btn');
    fireEvent.press(confirmBtn);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(signOutGoogle).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.clear).toHaveBeenCalledTimes(1);
      expect(clearAllSecureStorage).toHaveBeenCalledTimes(1);
      expect(clearSteamApiKey).toHaveBeenCalledTimes(1);
    });
  });

  it('aligns title and cards to the left in portrait on standard screens (width <= 640px)', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 400,
      height: 800,
    });

    const { getByText } = render(<OptionsView />);
    const title = getByText('Options');
    expect(title.props.className).toContain('text-left');
  });

  it('centers title with respect to buttons in landscape', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      isTablet: false,
      width: 800,
      height: 400,
    });

    const { getByText } = render(<OptionsView />);
    const title = getByText('Options');
    expect(title.props.className).toContain('text-center');
  });

  it('centers title and cards when screen width is larger than 640px in portrait', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      isTablet: true,
      width: 768,
      height: 1024,
    });

    const { getByText } = render(<OptionsView />);
    const title = getByText('Options');
    expect(title.props.className).toContain('text-center');
  });
});
