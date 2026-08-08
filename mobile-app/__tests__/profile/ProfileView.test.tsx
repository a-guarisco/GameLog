import { render, screen } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';
import {
  useGetOwnedGames,
  useGetGameGenreChartData,
  useGetPlayersInfo,
} from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi');

jest.mock('@gamelog/game/HeaderGameImage', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ appid }: any) => <View testID="profile-header-image" appid={appid} />,
  };
});

jest.mock('@gamelog/common/BannerInfo', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ title, secondaryText, iconUrl }: any) => (
      <View testID="profile-banner">
        <Text>{title}</Text>
        <Text>{secondaryText}</Text>
        <Text>{iconUrl}</Text>
      </View>
    ),
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

const setupLoadedMocks = () => {
  mockUseGetOwnedGames.mockReturnValue({
    ownedGames: { response: { games: [] } },
    isLoadingOwnedGames: false,
    errorOwnedGames: null,
  });
  mockUseGetGameGenreChartData.mockReturnValue({
    genreChartData: [{ label: 'Action', value: 10 }],
    isLoadingGenreChart: false,
    errorGenreChart: null,
  });
  mockUseGetPlayersInfo.mockReturnValue({
    playersInfo: { response: { players: [{ personaname: 'User' }] } },
    isLoadingPlayersInfo: false,
    errorPlayersInfo: null,
  });
};

describe('ProfileView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows LoadingBox with "Loading Profile" while owned games are loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: [],
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: null,
      isLoadingPlayersInfo: false,
      errorPlayersInfo: null,
    });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-loading-box')).toBeTruthy();
    expect(screen.getByText('Loading Profile')).toBeTruthy();
    expect(screen.queryByTestId('profile-banner')).toBeNull();
  });

  it('shows LoadingBox while player info is loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: { response: { games: [] } },
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: [],
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });
    mockUseGetPlayersInfo.mockReturnValue({
      playersInfo: null,
      isLoadingPlayersInfo: true,
      errorPlayersInfo: null,
    });

    render(<ProfileView />);

    expect(screen.getByTestId('profile-loading-box')).toBeTruthy();
    expect(screen.queryByTestId('profile-banner')).toBeNull();
  });

  it('renders banner and all page content at once when all data finishes loading', () => {
    setupLoadedMocks();

    render(<ProfileView />);

    expect(screen.queryByTestId('profile-loading-box')).toBeNull();
    expect(screen.getByTestId('profile-header-image')).toBeTruthy();
    expect(screen.getByTestId('profile-banner')).toBeTruthy();
    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
    expect(screen.getByTestId('total-hours-pie-chart')).toBeTruthy();
    expect(screen.getByTestId('genre-radar-chart')).toBeTruthy();
    expect(screen.getByTestId('os-share-chart')).toBeTruthy();
  });
});
