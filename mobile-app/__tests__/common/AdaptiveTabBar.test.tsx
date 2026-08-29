import { render, fireEvent } from '@testing-library/react-native';
import { AdaptiveTabBar } from '@gamelog/common/AdaptiveTabBar';
import * as OrientationHook from '@gamelog/common/useOrientation';

jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

describe('AdaptiveTabBar', () => {
  const mockNavigation: any = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
  };

  const mockState: any = {
    index: 0,
    routes: [
      { key: 'GameListTab-1', name: 'GameListTab' },
      { key: 'ProfileTab-2', name: 'ProfileTab' },
      { key: 'SocialTab-3', name: 'SocialTab' },
      { key: 'DevTab-4', name: 'DevTab' },
    ],
  };

  const defaultProps: any = {
    state: mockState,
    navigation: mockNavigation,
    descriptors: {},
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bottom tab bar in portrait mode with labels and handles tab press', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      width: 390,
      height: 844,
    });

    const { getByLabelText, getByText } = render(<AdaptiveTabBar {...defaultProps} />);

    expect(getByText('Games')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Dev')).toBeTruthy();

    const profileTab = getByLabelText('Profile');
    expect(profileTab).toBeTruthy();

    fireEvent.press(profileTab);
    expect(mockNavigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'ProfileTab' })
    );
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileTab');
  });

  it('renders left rail in landscape mode with labels and handles tab press', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      width: 844,
      height: 390,
    });

    const { getByLabelText, getByText } = render(<AdaptiveTabBar {...defaultProps} />);

    expect(getByText('Games')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Dev')).toBeTruthy();

    const socialTab = getByLabelText('Social');
    expect(socialTab).toBeTruthy();

    fireEvent.press(socialTab);
    expect(mockNavigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'SocialTab' })
    );
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SocialTab');
  });
});
