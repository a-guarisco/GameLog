import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ProfileBanner from '@gamelog/profile/ProfileBanner';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';

jest.mock('@gamelog/common/gluestack/spinner', () => {
  const { View } = jest.requireActual('react-native');
  return { Spinner: () => <View testID="spinner" /> };
});

jest.mock('@gamelog/common/gluestack/text', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text> };
});

jest.mock('@gamelog/common/gluestack/vstack', () => {
  const { View } = jest.requireActual('react-native');
  return { VStack: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@gamelog/common/Banner', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: (props: any) => <View testID="banner" {...props} /> };
});

jest.mock('@gamelog/common/BannerInfo', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ title, iconUrl }: any) => (
      <View testID="banner-info">
        <Text testID="banner-title">{title}</Text>
        <Text testID="banner-icon">{iconUrl}</Text>
      </View>
    ),
  };
});

jest.mock('@gamelog/api-manager/steamAssets', () => ({
  steamAssetUrls: { getGameHeaderImage: jest.fn((appid: string) => `https://cdn/${appid}.jpg`) },
}));

const mockUseGetOwnedGames = jest.fn();
const mockUseGetPlayersInfo = jest.fn();

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: (...args: any[]) => mockUseGetOwnedGames(...args),
  useGetPlayersInfo: (...args: any[]) => mockUseGetPlayersInfo(...args),
}));

const PLAYER = {
  personaname: 'SteamUser',
  profileurl: 'https://steamcommunity.com/id/steamuser/',
  avatarfull: 'https://cdn/avatar.jpg',
};

const setupMocks = ({
  isLoadingPlayersInfo = false,
  errorPlayersInfo = null as Error | null | undefined,
  player = PLAYER as typeof PLAYER | null,
  firstGameAppid = '1234',
} = {}) => {
  mockUseGetOwnedGames.mockReturnValue({
    ownedGames: { response: { games: [{ appid: firstGameAppid }] } },
  });
  mockUseGetPlayersInfo.mockReturnValue({
    playersInfo: player ? { response: { players: [player] } } : null,
    isLoadingPlayersInfo,
    errorPlayersInfo,
  });
};

beforeEach(() => jest.clearAllMocks());

describe('ProfileBanner — loading & error states', () => {
  it('renders a spinner while player info is loading', () => {
    setupMocks({ isLoadingPlayersInfo: true });
    render(<ProfileBanner userId="123" />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('does not render the banner while loading', () => {
    setupMocks({ isLoadingPlayersInfo: true });
    render(<ProfileBanner userId="123" />);
    expect(screen.queryByTestId('banner')).toBeNull();
  });

  it('renders an error message when the request fails', () => {
    setupMocks({ errorPlayersInfo: new Error('fail') });
    render(<ProfileBanner userId="123" />);
    expect(screen.getByText(/Failed to load profile/i)).toBeTruthy();
  });

  it('does not render the banner when there is an error', () => {
    setupMocks({ errorPlayersInfo: new Error('fail') });
    render(<ProfileBanner userId="123" />);
    expect(screen.queryByTestId('banner')).toBeNull();
  });
});

describe('ProfileBanner — successful render', () => {
  it('renders Banner and BannerInfo when data is available', () => {
    setupMocks();
    render(<ProfileBanner userId="123" />);
    expect(screen.getByTestId('banner')).toBeTruthy();
    expect(screen.getByTestId('banner-info')).toBeTruthy();
  });

  it('displays the player personaname as the title', () => {
    setupMocks();
    render(<ProfileBanner userId="123" />);
    expect(screen.getByTestId('banner-title').props.children).toBe('SteamUser');
  });

  it('falls back to "Unknown User" when player is missing', () => {
    setupMocks({ player: null });
    render(<ProfileBanner userId="123" />);
    expect(screen.getByTestId('banner-title').props.children).toBe('Unknown User');
  });

  it('passes the player avatarfull as iconUrl to BannerInfo', () => {
    setupMocks();
    render(<ProfileBanner userId="123" />);
    expect(screen.getByTestId('banner-icon').props.children).toBe(PLAYER.avatarfull);
  });

  it('calls useGetPlayersInfo with an array containing the provided userId', () => {
    setupMocks();
    render(<ProfileBanner userId="abc" />);
    expect(mockUseGetPlayersInfo).toHaveBeenCalledWith(['abc']);
  });

  it('calls useGetOwnedGames with the hardcoded userId and false', () => {
    setupMocks();
    render(<ProfileBanner userId="abc" />);
    expect(mockUseGetOwnedGames).toHaveBeenCalledWith('76561198077919169', false);
  });
});

describe('ProfileBanner — game header image', () => {
  it('uses the first owned game appid to build the header image URL', () => {
    setupMocks({ firstGameAppid: '9999' });
    render(<ProfileBanner userId="123" />);
    expect(steamAssetUrls.getGameHeaderImage).toHaveBeenCalledWith('9999');
  });

  it('falls back to TEMP_APPID (236390) when ownedGames has no games', () => {
    mockUseGetOwnedGames.mockReturnValue({ ownedGames: null });
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: { response: { players: [PLAYER] } },
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });
    render(<ProfileBanner userId="123" />);
    expect(steamAssetUrls.getGameHeaderImage).toHaveBeenCalledWith('236390');
  });
});

describe('ProfileBanner — openSteamProfile', () => {
  it("opens the player's profileurl when the banner is pressed", () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    setupMocks();
    render(<ProfileBanner userId="123" />);
    fireEvent.press(screen.getByTestId('banner-info').parent!);
    expect(spy).toHaveBeenCalledWith(PLAYER.profileurl);
  });

  it('falls back to the Steam community URL when profileurl is missing', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    setupMocks({ player: { ...PLAYER, profileurl: '' } });
    render(<ProfileBanner userId="123" />);
    fireEvent.press(screen.getByTestId('banner-info').parent!);
    expect(spy).toHaveBeenCalledWith('https://steamcommunity.com/');
  });
});
