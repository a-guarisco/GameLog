import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { AdaptiveTabBar } from '@gamelog/common/AdaptiveTabBar';
import * as OrientationHook from '@gamelog/common/useOrientation';

jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));
jest.mock('@gamelog/common/devMenuConfig', () => ({
  isDevMenuEnabled: jest.fn(() => true),
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
    const devMenuConfig = require('@gamelog/common/devMenuConfig');
    jest.spyOn(devMenuConfig, 'isDevMenuEnabled').mockReturnValue(true);
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

    const gamesTab = getByLabelText('Games');
    expect(gamesTab).toBeTruthy();
    // Verify focused item does not have a background color highlight applied
    expect(gamesTab.props.style).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: expect.anything() })])
    );

    const socialTab = getByLabelText('Social');
    expect(socialTab).toBeTruthy();

    fireEvent.press(socialTab);
    expect(mockNavigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'SocialTab' })
    );
    expect(mockNavigation.navigate).toHaveBeenCalledWith('SocialTab');
  });

  it('renders "Options" label when dev menu is disabled', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 390,
      height: 844,
    });
    const devMenuConfig = require('@gamelog/common/devMenuConfig');
    jest.spyOn(devMenuConfig, 'isDevMenuEnabled').mockReturnValue(false);

    const { getByText, queryByText } = render(<AdaptiveTabBar {...defaultProps} />);

    expect(getByText('Options')).toBeTruthy();
    expect(queryByText('Dev')).toBeNull();
  });

  it('renders bottom tab bar on tablet in portrait mode', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: true,
      width: 768,
      height: 1024,
    });

    const { getByLabelText, getByText } = render(<AdaptiveTabBar {...defaultProps} />);

    expect(getByText('Games')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('Dev')).toBeTruthy();

    const gamesTab = getByLabelText('Games');
    expect(gamesTab).toBeTruthy();

    const profileTab = getByLabelText('Profile');
    fireEvent.press(profileTab);
    expect(mockNavigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'ProfileTab' })
    );
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileTab');
  });

  it('renders left rail with tablet dimensions in tablet landscape mode', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: true,
      width: 1024,
      height: 768,
    });

    const { getByLabelText, getByText } = render(<AdaptiveTabBar {...defaultProps} />);

    const gamesTab = getByLabelText('Games');
    expect(StyleSheet.flatten(gamesTab.props.style)).toEqual(
      expect.objectContaining({ width: 76 })
    );

    const gamesLabel = getByText('Games');
    expect(StyleSheet.flatten(gamesLabel.props.style)).toEqual(
      expect.objectContaining({ fontSize: 12 })
    );
  });
});
