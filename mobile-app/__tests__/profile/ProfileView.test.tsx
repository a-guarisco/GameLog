import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
  useGetPlaytimeByUser,
  useGetPlaytimeReport,
  useGetUserStreak,
} from '@gamelog/api-manager/useApi';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';

jest.mock('@gamelog/api-manager/useApi', () => ({
  ...jest.requireActual('@gamelog/api-manager/useApi'),
  useGetOwnedGames: jest.fn(),
  useGetGameGenreChartData: jest.fn(),
  useGetPlayersInfo: jest.fn(),
  useGetUserStreak: jest.fn(),
  useGetPlaytimeReport: jest.fn(),
  useGetPlaytimeByUser: jest.fn(),
}));

jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  getSteamId: jest.fn(),
}));

jest.mock('@gamelog/common/HeaderGameImage', () => {
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

jest.mock('@gamelog/common/charts/total-hours/TotalHoursDoughnut', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="total-hours-pie-chart" /> };
});
jest.mock('@gamelog/common/charts/genre-radar/GameGenreRadarChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="genre-radar-chart" /> };
});
jest.mock('@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="community-genre-radar-chart" /> };
});
jest.mock('@gamelog/report/ReportBox', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, ReportBox: () => <View testID="report-box" /> };
});
jest.mock('@gamelog/common/charts/playtime-trend/PlaytimeTrendChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="profile-playtime-trend" /> };
});
jest.mock('@gamelog/common/charts/playtime-blocks/PlaytimeBlocksChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="playtime-blocks-chart" /> };
});
jest.mock('@gamelog/common/charts/platform-split/PlatformSplitChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="profile-platform-split" /> };
});

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;
const mockUseGetGameGenreChartData = useGetGameGenreChartData as jest.Mock;
const mockUseGetPlayersInfo = useGetPlayersInfo as jest.Mock;
const mockUseGetUserStreak = useGetUserStreak as jest.Mock;
const mockUseGetPlaytimeReport = useGetPlaytimeReport as jest.Mock;
const mockUseGetPlaytimeByUser = useGetPlaytimeByUser as jest.Mock;

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
    refetchOwnedGames: jest.fn().mockResolvedValue(undefined),
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
    refetchPlayersInfo: jest.fn().mockResolvedValue(undefined),
    ...overrides.playersInfo,
  });
  mockUseGetUserStreak.mockReturnValue({
    userStreak: { streak: 12 },
    isLoadingUserStreak: false,
    errorUserStreak: null,
    refetchUserStreak: jest.fn().mockResolvedValue(undefined),
    ...overrides.userStreak,
  });
  mockUseGetPlaytimeReport.mockReturnValue({
    playtimeReport: {
      date: '2026-08-18',
      game_reports: [
        { app_id: '236390', today_play_time: 240, streak: 3 },
        { app_id: '730', today_play_time: 60, streak: 1 },
      ],
    },
    isLoadingPlaytimeReport: false,
    errorPlaytimeReport: null,
    refetchPlaytimeReport: jest.fn().mockResolvedValue(undefined),
    ...overrides.playtimeReport,
  });
  mockUseGetPlaytimeByUser.mockReturnValue({
    playtimeByUser: [
      { date: '2026-08-17', playtime_minutes: 90 },
      { date: '2026-08-18', playtime_minutes: 150 },
    ],
    isLoadingPlaytimeByUser: false,
    errorPlaytimeByUser: null,
    refetchPlaytimeByUser: jest.fn().mockResolvedValue(undefined),
    ...overrides.playtimeByUser,
  });
};

beforeEach(() => {
  (getSteamId as jest.Mock).mockReturnValue('123456789');
});

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
  mockUseGetPlaytimeReport.mockReturnValue({
    playtimeReport: null,
    isLoadingPlaytimeReport: !!loading.playtimeReport,
    errorPlaytimeReport: null,
  });
  mockUseGetPlaytimeByUser.mockReturnValue({
    playtimeByUser: null,
    isLoadingPlaytimeByUser: !!loading.playtimeByUser,
    errorPlaytimeByUser: null,
  });
};

describe('ProfileView — loading', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows Spinner while owned games are loading', () => {
    setupLoadingMocks({ ownedGames: true });

    render(<ProfileView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('shows Spinner while player info is loading', () => {
    setupLoadingMocks({ playersInfo: true });

    render(<ProfileView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('shows Spinner while the streak is loading', () => {
    setupLoadingMocks({ userStreak: true });

    render(<ProfileView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('shows Spinner while the two-week playtime report is loading', () => {
    setupLoadingMocks({ playtimeReport: true });

    render(<ProfileView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });

  it('shows Spinner while the day-by-day playtime history is loading', () => {
    setupLoadingMocks({ playtimeByUser: true });

    render(<ProfileView />);

    expect(screen.getByLabelText('loading')).toBeTruthy();
  });
});

describe('ProfileView — loaded', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the identity block once every request has resolved', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(getSteamId).toHaveBeenCalled();
    expect(screen.queryByTestId('profile-loading-box')).toBeNull();
    expect(screen.getByText('filopixel')).toBeTruthy();
    expect(screen.getByTestId('profile-streak-chip')).toBeTruthy();
  });

  it('puts the most played game behind the header and names it', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.getByTestId('profile-header-image').props.appid).toBe('236390');
  });

  it('falls back to the placeholder artwork for an empty library', () => {
    setupLoadedMocks({ ownedGames: { ownedGames: { response: { game_count: 0, games: [] } } } });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-header-image').props.appid).toBeUndefined();
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

  it('sums the whole playtime report into the two-week stat', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    // 240 + 60 minutes across the two reported games.
    expect(screen.getByText('2 weeks')).toBeTruthy();
    expect(screen.getByText('5 h')).toBeTruthy();
  });

  it('falls back to zero hours when the report comes back empty', () => {
    setupLoadedMocks({
      playtimeReport: { playtimeReport: { date: '2026-08-18', game_reports: [] } },
    });

    render(<ProfileView />);

    expect(screen.getByText('0 h')).toBeTruthy();
  });

  it('plots the backend playtime history on the overview tab', () => {
    setupLoadedMocks();
    render(<ProfileView />);
    expect(screen.getByTestId('profile-playtime-trend')).toBeTruthy();
  });

  it('reaches every chart through the tabs', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.getByTestId('profile-playtime-trend')).toBeTruthy();
    expect(screen.getByTestId('profile-platform-split')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-tab-time'));
    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
    expect(screen.getByTestId('total-hours-pie-chart')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-tab-genres'));
    expect(screen.getByTestId('genre-radar-chart')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-tab-community'));
    expect(screen.getByTestId('profile-community-tab')).toBeTruthy();
  });

  it('calls all refetch functions on pull-to-refresh', async () => {
    const mockRefetchOwnedGames = jest.fn().mockResolvedValue(undefined);
    const mockRefetchPlayersInfo = jest.fn().mockResolvedValue(undefined);
    const mockRefetchUserStreak = jest.fn().mockResolvedValue(undefined);
    const mockRefetchPlaytimeReport = jest.fn().mockResolvedValue(undefined);
    const mockRefetchPlaytimeByUser = jest.fn().mockResolvedValue(undefined);

    setupLoadedMocks({
      ownedGames: { refetchOwnedGames: mockRefetchOwnedGames },
      player: {}, // mockUseGetPlayersInfo returns player
      playtimeReport: { refetchPlaytimeReport: mockRefetchPlaytimeReport },
      playtimeByUser: { refetchPlaytimeByUser: mockRefetchPlaytimeByUser },
    });

    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: { response: { players: [PLAYER] } },
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
      refetchPlayersInfo: mockRefetchPlayersInfo,
    });

    mockUseGetUserStreak.mockReturnValue({
      userStreak: { streak: 12 },
      isLoadingUserStreak: false,
      errorUserStreak: null,
      refetchUserStreak: mockRefetchUserStreak,
    });

    render(<ProfileView />);

    const scrollView = screen.getByTestId('scrollable-page-scroll');

    await act(async () => {
      fireEvent(scrollView, 'refresh');
    });

    expect(mockRefetchOwnedGames).toHaveBeenCalledTimes(1);
    expect(mockRefetchPlayersInfo).toHaveBeenCalledTimes(1);
    expect(mockRefetchUserStreak).toHaveBeenCalledTimes(1);
    expect(mockRefetchPlaytimeReport).toHaveBeenCalledTimes(1);
    expect(mockRefetchPlaytimeByUser).toHaveBeenCalledTimes(1);
  });
});
