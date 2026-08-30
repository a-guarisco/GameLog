import { render, screen, fireEvent } from '@testing-library/react-native';
import CommunityGenreRadarChart from '@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart';
import { useCommunityGenreRadarChart } from '@gamelog/common/charts/community-genre-radar/useCommunityGenreRadarChart';

jest.mock('react-native-gifted-charts', () => ({ RadarChart: 'RadarChart' }));

jest.mock('@gamelog/common/charts/community-genre-radar/useCommunityGenreRadarChart', () => ({
  useCommunityGenreRadarChart: jest.fn(),
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, isLoading, error, ErrorBehaviour }: any) => (
    <View testID="chart-wrapper">
      {error && ErrorBehaviour ? (
        <ErrorBehaviour />
      ) : (
        !isLoading &&
        children({
          cardWidth: 350,
          theme: {
            '--color-outline-100': '100,100,100',
            '--color-typography-400': '150,150,150',
          },
        })
      )}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

describe('CommunityGenreRadarChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders scope tabs (Global, Region, Friends)', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [],
      labels: [],
      maxValue: 1,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    render(<CommunityGenreRadarChart ownedGames={null} />);

    expect(screen.getByTestId('community-radar-scope-global')).toBeTruthy();
    expect(screen.getByTestId('community-radar-scope-region')).toBeTruthy();
    expect(screen.getByTestId('community-radar-scope-friends')).toBeTruthy();
  });

  it('switches scope when a tab is pressed', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [],
      labels: [],
      maxValue: 1,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    render(<CommunityGenreRadarChart ownedGames={null} />);

    fireEvent.press(screen.getByTestId('community-radar-scope-region'));

    expect(useCommunityGenreRadarChart).toHaveBeenCalledWith(null, 'region');
  });

  it('renders warning when backend returns error (e.g. 400 no region set)', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [],
      labels: [],
      maxValue: 1,
      isLoading: false,
      errorCommunity: true,
      errorMessageCommunity: 'User region is not set',
    });

    render(<CommunityGenreRadarChart ownedGames={null} />);

    expect(screen.getByText('User region is not set')).toBeTruthy();
  });

  it('renders RadarChart with dataSet and legend when data is available', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [
        [50, 20],
        [40, 30],
      ],
      labels: ['Action', 'RPG'],
      comparisonItems: [
        { id: '1', description: 'Action', userPercentage: 50, communityPercentage: 40 },
        { id: '2', description: 'RPG', userPercentage: 20, communityPercentage: 30 },
      ],
      maxValue: 50,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    const { UNSAFE_getByType } = render(<CommunityGenreRadarChart ownedGames={null} />);

    expect(screen.getByText('You (%)')).toBeTruthy();
    expect(screen.getByText('Community (%)')).toBeTruthy();
    expect(screen.getByText('You: 50%')).toBeTruthy();
    expect(screen.getByText('Others: 40%')).toBeTruthy();

    const radarChart = UNSAFE_getByType('RadarChart' as any);
    expect(radarChart.props.dataSet).toEqual([
      [50, 20],
      [40, 30],
    ]);
    expect(radarChart.props.labels).toEqual(['Action', 'RPG']);
    expect(radarChart.props.maxValue).toBe(50);
  });
});
