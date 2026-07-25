import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ProfileBanner from '@gamelog/profile/ProfileBanner';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';

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

const PLAYER = {
  personaname: 'SteamUser',
  profileurl: 'https://steamcommunity.com/id/steamuser/',
  avatarfull: 'https://cdn/avatar.jpg',
};

const PLAYERS_INFO = { response: { players: [PLAYER] } };

beforeEach(() => jest.clearAllMocks());

describe('ProfileBanner — error state', () => {
  it('renders an error message when playersInfo is not provided', () => {
    render(<ProfileBanner userId="123" />);
    expect(screen.getByText(/Failed to load profile/i)).toBeTruthy();
  });

  it('does not render the banner when playersInfo is missing', () => {
    render(<ProfileBanner userId="123" />);
    expect(screen.queryByTestId('banner')).toBeNull();
  });
});

describe('ProfileBanner — successful render', () => {
  it('renders Banner and BannerInfo when data is available', () => {
    render(<ProfileBanner userId="123" playersInfo={PLAYERS_INFO} />);
    expect(screen.getByTestId('banner')).toBeTruthy();
    expect(screen.getByTestId('banner-info')).toBeTruthy();
  });

  it('displays the player personaname as the title', () => {
    render(<ProfileBanner userId="123" playersInfo={PLAYERS_INFO} />);
    expect(screen.getByTestId('banner-title').props.children).toBe('SteamUser');
  });

  it('falls back to "Unknown User" when player is missing from response', () => {
    render(<ProfileBanner userId="123" playersInfo={{ response: { players: [] } }} />);
    expect(screen.getByTestId('banner-title').props.children).toBe('Unknown User');
  });

  it('passes the player avatarfull as iconUrl to BannerInfo', () => {
    render(<ProfileBanner userId="123" playersInfo={PLAYERS_INFO} />);
    expect(screen.getByTestId('banner-icon').props.children).toBe(PLAYER.avatarfull);
  });
});

describe('ProfileBanner — game header image', () => {
  it('uses the first owned game appid from props to build the header image URL', () => {
    const ownedGames = { response: { games: [{ appid: '9999' }] } };
    render(<ProfileBanner userId="123" ownedGames={ownedGames} playersInfo={PLAYERS_INFO} />);
    expect(steamAssetUrls.getGameHeaderImage).toHaveBeenCalledWith('9999');
  });

  it('falls back to TEMP_APPID (236390) when ownedGames has no games', () => {
    render(<ProfileBanner userId="123" ownedGames={null} playersInfo={PLAYERS_INFO} />);
    expect(steamAssetUrls.getGameHeaderImage).toHaveBeenCalledWith('236390');
  });
});

describe('ProfileBanner — openSteamProfile', () => {
  it("opens the player's profileurl when the banner is pressed", () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<ProfileBanner userId="123" playersInfo={PLAYERS_INFO} />);
    fireEvent.press(screen.getByTestId('banner-info').parent!);
    expect(spy).toHaveBeenCalledWith(PLAYER.profileurl);
  });

  it('falls back to the Steam community URL when profileurl is missing', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const noUrlPlayersInfo = { response: { players: [{ ...PLAYER, profileurl: '' }] } };
    render(<ProfileBanner userId="123" playersInfo={noUrlPlayersInfo} />);
    fireEvent.press(screen.getByTestId('banner-info').parent!);
    expect(spy).toHaveBeenCalledWith('https://steamcommunity.com/');
  });
});
