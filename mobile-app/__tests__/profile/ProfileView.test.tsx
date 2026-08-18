import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
  useGetUserStreak,
} from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi');

jest.mock('@gamelog/game/HeaderGameImage', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ appid }: any) => <View testID="profile-header-image" appid={appid} />,
  };
});

jest.mock('@gamelog/common/feedbacks/LoadingBox', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    LoadingBox: ({ message, ...props }: any) => (
      <View testID={props.testID ?? 'loading-box'}>
        <Text>{message}</Text>
      </View>
    ),
  };
});

jest.mock('@gamelog/common/charts/total-hours/TotalHoursChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="total-hours-chart" /> };
});
jest.mock('@gamelog/common/charts/total-hours/TotalHoursPieChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="total-hours-pie-chart" /> };
});
jest.mock('@gamelog/common/charts/os-share/OsShareChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="os-share-chart" /> };
});
jest.mock('@gamelog/common/charts/genre-radar/GameGenreRadarChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="genre-radar-chart" /> };
});

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;
const mockUseGetGameGenreChartData = useGetGameGenreChartData as jest.Mock;
const mockUseGetPlayersInfo = useGetPlayersInfo as jest.Mock;
const mockUseGetUserStreak = useGetUserStreak as jest.Mock;

const buildGame = (overrides: Record<string, unknown> = {}) => ({
  appid: '236390',
  name: 'War Thunder',
  playtime_forever: 24750,
  img_icon_url: '',
  has_community_visible_stats: true,
  playtime_windows_forever: 24750,
  playtime_mac_forever: 0,
  playtime_linux_forever: 0,
  playtime_deck_forever: 0,
  rtime_last_played: 1785334609,
  ...overrides,
});

const PLAYER = {
  personaname: 'filopixel',
  avatarfull: 'https://cdn/avatar.jpg',
  timecreated: Date.UTC(2011, 6, 4) / 1000,
};

const setupLoadedMocks = (overrides: Record<string, any> = {}) => {
  mockUseGetOwnedGames.mockReturnValue({
    ownedGames: {
      response: {
        game_count: 160,
        games: [
          buildGame({ appid: '730', name: 'Counter-Strike 2', playtime_forever: 16092 }),
          buildGame(),
        ],
      },
    },
    isLoadingOwnedGames: false,
    errorOwnedGames: null,
    ...overrides.ownedGames,
  });
  mockUseGetGameGenreChartData.mockReturnValue({
    genreChartData: [{ label: 'Action', value: 10 }],
    isLoadingGenreChart: false,
    errorGenreChart: null,
  });
  mockUseGetPlayersInfo.mockReturnValue({
    playersInfo: { response: { players: [{ ...PLAYER, ...overrides.player }] } },
    isLoadingPlayersInfo: false,
    errorPlayersInfo: null,
  });
  mockUseGetUserStreak.mockReturnValue({
    userStreak: { streak: 12 },
    isLoadingUserStreak: false,
    errorUserStreak: null,
  });
};

const setupLoadingMocks = (loading: Record<string, boolean>) => {
  mockUseGetOwnedGames.mockReturnValue({
    ownedGames: null,
    isLoadingOwnedGames: !!loading.ownedGames,
    errorOwnedGames: null,
  });
  mockUseGetGameGenreChartData.mockReturnValue({
    genreChartData: [],
    isLoadingGenreChart: !!loading.genreChart,
    errorGenreChart: null,
  });
  mockUseGetPlayersInfo.mockReturnValue({
    playersInfo: null,
    isLoadingPlayersInfo: !!loading.playersInfo,
    errorPlayersInfo: null,
  });
  mockUseGetUserStreak.mockReturnValue({
    userStreak: null,
    isLoadingUserStreak: !!loading.userStreak,
    errorUserStreak: null,
  });
};

describe('ProfileView — loading', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows LoadingBox with "Loading Profile" while owned games are loading', () => {
    setupLoadingMocks({ ownedGames: true });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-loading-box')).toBeTruthy();
    expect(screen.getByText('Loading Profile')).toBeTruthy();
    expect(screen.queryByTestId('profile-header-image')).toBeNull();
  });

  it('shows LoadingBox while player info is loading', () => {
    setupLoadingMocks({ playersInfo: true });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-loading-box')).toBeTruthy();
  });

  it('shows LoadingBox while the streak is loading', () => {
    setupLoadingMocks({ userStreak: true });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-loading-box')).toBeTruthy();
  });
});

describe('ProfileView — loaded', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the identity block once every request has resolved', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.queryByTestId('profile-loading-box')).toBeNull();
    expect(screen.getByText('filopixel')).toBeTruthy();
    expect(screen.getByTestId('profile-streak-chip')).toBeTruthy();
  });

  it('puts the most played game behind the header and names it', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.getByTestId('profile-header-image').props.appid).toBe('236390');
    expect(screen.getByTestId('profile-most-played')).toHaveTextContent(/War Thunder/);
  });

  it('falls back to the placeholder artwork for an empty library', () => {
    setupLoadedMocks({ ownedGames: { ownedGames: { response: { game_count: 0, games: [] } } } });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-header-image').props.appid).toBe('236390');
    expect(screen.queryByTestId('profile-most-played')).toBeNull();
  });

  it('falls back to "Unknown User" when the player is missing', () => {
    setupLoadedMocks();
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: { response: { players: [] } },
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileView />);

    expect(screen.getByText('Unknown User')).toBeTruthy();
    expect(screen.queryByTestId('profile-member-since-chip')).toBeNull();
  });

  it('derives the account age chip from the Steam creation date', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.getByText('Since 2011')).toBeTruthy();
  });

  it('renders the stat band from the library', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.getByText('160')).toBeTruthy();
    expect(screen.getByText('Owned')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
  });

  it('opens on the overview tab with the top games ranked', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.getByTestId('profile-top-games')).toBeTruthy();
    expect(screen.getByTestId('profile-top-game-fill-236390').props.style).toEqual(
      expect.objectContaining({ width: '100%' })
    );
  });

  it('reaches every chart through the tabs', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    fireEvent.press(screen.getByTestId('profile-tab-time'));
    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
    expect(screen.getByTestId('total-hours-pie-chart')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-tab-genres'));
    expect(screen.getByTestId('genre-radar-chart')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-tab-platforms'));
    expect(screen.getByTestId('os-share-chart')).toBeTruthy();
  });
});
