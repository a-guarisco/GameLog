import { render, screen, fireEvent } from '@testing-library/react-native';
import CommunityGenreRadarChart from '@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart';
import { useCommunityGenreRadarChart } from '@gamelog/common/charts/community-genre-radar/useCommunityGenreRadarChart';
import { useOrientation } from '@gamelog/common/useOrientation';

jest.mock('react-native-gifted-charts', () => ({ RadarChart: 'RadarChart' }));

jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: jest.fn(() => ({
    isLandscape: false,
    width: 400,
    height: 800,
  })),
}));

jest.mock('@gamelog/common/charts/community-genre-radar/useCommunityGenreRadarChart', () => ({
  useCommunityGenreRadarChart: jest.fn(),
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, headerRight, isLoading, error, ErrorBehaviour }: any) => (
    <View testID="chart-wrapper">
      {headerRight}
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

  it('renders scope segmented control options (Global, Region, Friends)', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [],
      labels: [],
      comparisonItems: [],
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

  it('switches scope when a segment option is pressed', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [],
      labels: [],
      comparisonItems: [],
      maxValue: 1,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    render(<CommunityGenreRadarChart ownedGames={null} />);

    fireEvent.press(screen.getByTestId('community-radar-scope-region'));

    expect(useCommunityGenreRadarChart).toHaveBeenCalledWith(null, 'region', undefined);
  });

  it('renders warning when backend returns error (e.g. 400 no region set)', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [],
      labels: [],
      comparisonItems: [],
      maxValue: 1,
      isLoading: false,
      errorCommunity: true,
      errorMessageCommunity: 'User region is not set',
    });

    render(<CommunityGenreRadarChart ownedGames={null} />);

    expect(screen.getByText('User region is not set')).toBeTruthy();
  });

  it('renders RadarChart and legend, hides breakdown bars by default, and reveals them when toggle is pressed', () => {
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

    // Legend is visible
    expect(screen.getByText('You (%)')).toBeTruthy();
    expect(screen.getByText('Others (%)')).toBeTruthy();

    // Radar chart is rendered
    const radarChart = UNSAFE_getByType('RadarChart' as any);
    expect(radarChart.props.dataSet).toEqual([
      [50, 20],
      [40, 30],
    ]);
    expect(radarChart.props.labels).toEqual(['Action', 'RPG']);
    expect(radarChart.props.maxValue).toBe(50);

    // Breakdown bars are hidden by default
    expect(screen.queryByText('50%')).toBeNull();
    expect(screen.queryByTestId('user-progress-1')).toBeNull();

    // Expand toggle button exists
    const toggleButton = screen.getByTestId('community-genre-expand-toggle');
    expect(toggleButton).toBeTruthy();

    // Press toggle button to expand
    fireEvent.press(toggleButton);

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('30%')).toBeTruthy();
    expect(screen.getByTestId('user-progress-1')).toBeTruthy();
    expect(screen.getByTestId('others-progress-1')).toBeTruthy();

    // Press toggle button again to collapse
    fireEvent.press(toggleButton);

    expect(screen.queryByText('50%')).toBeNull();
    expect(screen.queryByTestId('user-progress-1')).toBeNull();
  });

  it('calls onExpandedChange when expand toggle is pressed', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [[50, 20]],
      labels: ['Action'],
      comparisonItems: [{ id: '1', description: 'Action', userPercentage: 50, communityPercentage: 40 }],
      maxValue: 50,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    const onExpandedChange = jest.fn();
    render(<CommunityGenreRadarChart ownedGames={null} onExpandedChange={onExpandedChange} />);

    const toggleButton = screen.getByTestId('community-genre-expand-toggle');

    fireEvent.press(toggleButton);
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    fireEvent.press(toggleButton);
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it('scales chartSize proportionally to 55% of height in landscape mode', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      width: 800,
      height: 400,
    });
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [[50, 20]],
      labels: ['Action'],
      comparisonItems: [{ id: '1', description: 'Action', userPercentage: 50, communityPercentage: 40 }],
      maxValue: 50,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    const { UNSAFE_getByType } = render(<CommunityGenreRadarChart ownedGames={null} />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    // Height 400 * 0.55 = 220, cardWidth 350 - 8 = 342 => min(220, 342) = 220
    expect(radarChart.props.chartSize).toBe(220);
  });

  it('renders targetUserName in legend with numberOfLines={2}', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [[50, 20]],
      labels: ['Action'],
      comparisonItems: [{ id: '1', description: 'Action', userPercentage: 50, communityPercentage: 40 }],
      maxValue: 50,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    render(
      <CommunityGenreRadarChart
        ownedGames={null}
        targetUserId="user-123"
        targetUserName="DeadSkorpioProGamerMC"
      />
    );

    const legendText = screen.getByText('DeadSkorpioProGamerMC (%)');
    expect(legendText).toBeTruthy();
    expect(legendText.props.numberOfLines).toBe(2);
  });

  it('caps chartSize at MAX_RADAR_SIZE (400) when cardWidth is large', () => {
    (useCommunityGenreRadarChart as jest.Mock).mockReturnValue({
      dataSet: [[50, 20]],
      labels: ['Action'],
      comparisonItems: [{ id: '1', description: 'Action', userPercentage: 50, communityPercentage: 40 }],
      maxValue: 50,
      isLoading: false,
      errorCommunity: false,
      errorMessageCommunity: null,
    });

    const { UNSAFE_getByType } = render(
      <CommunityGenreRadarChart ownedGames={null} />
    );
    const radarChart = UNSAFE_getByType('RadarChart' as any);
    expect(radarChart.props.chartSize).toBeLessThanOrEqual(400);
  });
});

