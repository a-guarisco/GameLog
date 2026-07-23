import { render, screen } from '@testing-library/react-native';
import ProfileView from '@gamelog/profile/ProfileView';
import { useGetOwnedGames, useGetGameGenreChartData } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi');
jest.mock('@gamelog/profile/ProfileBanner', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: (props: any) => <View testID="profile-banner" {...props} /> };
});

jest.mock('@gamelog/common/gluestack/spinner', () => {
  const { View } = jest.requireActual('react-native');
  return { Spinner: (props: any) => <View testID={props.testID ?? 'spinner'} /> };
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

describe('ProfileView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ProfileBanner first and shows content spinner while content is loading', () => {
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

    render(<ProfileView />);

    expect(screen.getByTestId('profile-banner')).toBeTruthy();
    expect(screen.getByTestId('content-spinner')).toBeTruthy();
    expect(screen.queryByTestId('total-hours-chart')).toBeNull();
  });

  it('renders all page content components at once when data finishes loading', () => {
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

    render(<ProfileView />);

    expect(screen.getByTestId('profile-banner')).toBeTruthy();
    expect(screen.queryByTestId('content-spinner')).toBeNull();
    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
    expect(screen.getByTestId('total-hours-pie-chart')).toBeTruthy();
    expect(screen.getByTestId('genre-radar-chart')).toBeTruthy();
    expect(screen.getByTestId('os-share-chart')).toBeTruthy();
  });
});
