import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ProfileBanner from '@gamelog/components/profile-view/ProfileBanner';

import { useGetPlayersInfo } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetPlayersInfo: jest.fn(),
}));

jest.mock('@gamelog/common/BannerInfo', () => {
  const { View, Text } = jest.requireActual('react-native');
  const MockBannerInfo = ({
    title,
    secondaryText,
    iconUrl,
    backgroundColor,
    height,
    justifyContent,
  }: any) => (
    <View testID="banner-info">
      <Text testID="banner-title">{title}</Text>
      <Text testID="banner-secondary">{secondaryText}</Text>
      <Text testID="banner-icon">{iconUrl}</Text>
      <Text testID="banner-bg">{backgroundColor}</Text>
      <Text testID="banner-height">{height}</Text>
      <Text testID="banner-justify">{justifyContent}</Text>
    </View>
  );

  MockBannerInfo.displayName = 'MockBannerInfo';
  return MockBannerInfo;
});

jest.mock('@gamelog/components/ui/spinner', () => {
  const { View } = jest.requireActual('react-native');

  const MockSpinner = ({ size }: any) => (
    <View testID="spinner" accessibilityLabel={`spinner-${size}`} />
  );
  MockSpinner.displayName = 'MockSpinner';

  return {
    Spinner: MockSpinner,
  };
});

jest.mock('@gamelog/components/ui/text', () => {
  const { Text } = jest.requireActual('react-native');

  const MockText = ({ children, className }: any) => (
    <Text testID="error-text" className={className}>
      {children}
    </Text>
  );
  MockText.displayName = 'MockText';

  return {
    Text: MockText,
  };
});

jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

const mockUseGetPlayersInfo = useGetPlayersInfo as jest.Mock;

const mockPlayerData = {
  response: {
    players: [
      {
        personaname: 'TestUser',
        profileurl: 'https://steamcommunity.com/id/testuser/',
        avatarfull: 'https://example.com/avatar.jpg',
      },
    ],
  },
};

const defaultProps = {
  userId: 'user-123',
};

describe('ProfileBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a spinner while loading', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: null,
      isLoadingPlayersInfo: true,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.getByTestId('spinner')).toBeTruthy();
    expect(screen.queryByTestId('banner-info')).toBeNull();
    expect(screen.queryByTestId('error-text')).toBeNull();
  });

  it('renders an error message when fetch fails', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: null,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: new Error('Network error'),
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.queryByTestId('spinner')).toBeNull();
    expect(screen.queryByTestId('banner-info')).toBeNull();
    expect(screen.getByTestId('error-text')).toBeTruthy();
    expect(screen.getByTestId('error-text').props.children).toBe(
      'Failed to load global achievements, please try again later.'
    );
  });

  it('renders banner info when data loads successfully', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: mockPlayerData,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.queryByTestId('spinner')).toBeNull();
    expect(screen.queryByTestId('error-text')).toBeNull();
    expect(screen.getByTestId('banner-info')).toBeTruthy();
  });

  it('displays the player username in BannerInfo', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: mockPlayerData,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.getByTestId('banner-title').props.children).toBe('TestUser');
  });

  it('falls back to "Unknown User" when personaname is missing', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: { response: { players: [{ profileurl: '', avatarfull: '' }] } },
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.getByTestId('banner-title').props.children).toBe('Unknown User');
  });

  it('passes avatar URL to BannerInfo', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: mockPlayerData,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.getByTestId('banner-icon').props.children).toBe('https://example.com/avatar.jpg');
  });

  it('passes correct styling props to BannerInfo', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: mockPlayerData,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    expect(screen.getByTestId('banner-bg').props.children).toBe('bg-background-100');
    expect(screen.getByTestId('banner-height').props.children).toBe('h-32');
    expect(screen.getByTestId('banner-justify').props.children).toBe('justify-end');
  });

  it('opens the player Steam profile URL when pressed', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: mockPlayerData,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    fireEvent.press(screen.getByTestId('banner-info').parent!);

    expect(Linking.openURL).toHaveBeenCalledWith('https://steamcommunity.com/id/testuser/');
  });

  it('opens fallback URL when profileurl is missing', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: { response: { players: [{ personaname: 'TestUser', avatarfull: '' }] } },
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner {...defaultProps} />);

    fireEvent.press(screen.getByTestId('banner-info').parent!);

    expect(Linking.openURL).toHaveBeenCalledWith('https://steamcommunity.com/');
  });

  it('does not open URL when still loading', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: null,
      isLoadingPlayersInfo: true,
      errorPlayersInfo: null,
    });

    // During loading, the Pressable is not rendered at all — just a Spinner
    render(<ProfileBanner {...defaultProps} />);

    expect(screen.queryByTestId('banner-info')).toBeNull();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('calls useGetPlayersInfo with a memoized array containing the userId', () => {
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: mockPlayerData,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileBanner userId="abc-999" />);

    expect(mockUseGetPlayersInfo).toHaveBeenCalledWith(['abc-999']);
  });
});
