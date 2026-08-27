import { render, screen } from '@testing-library/react-native';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import { useGenreRadarChart } from '@gamelog/common/charts/genre-radar/useGenreRadarChart';

jest.mock('react-native-gifted-charts', () => ({ RadarChart: 'RadarChart' }));
jest.mock('@gamelog/utils/formatUtils', () => ({
  formatMinutesToHours: jest.fn((m) => `${m}m`),
}));

jest.mock('@gamelog/common/charts/genre-radar/useGenreRadarChart', () => ({
  useGenreRadarChart: jest.fn(),
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">
      {!isLoading &&
        !error &&
        children({
          cardWidth: 350,
          theme: {
            '--color-typography-200': '200,200,200',
            '--color-background-200': '50,50,50',
          },
        })}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

beforeEach(() => jest.clearAllMocks());

describe('GameGenreRadarChart', () => {
  it('renders empty state when values are empty', () => {
    (useGenreRadarChart as jest.Mock).mockReturnValue({
      values: [],
      labels: [],
    });

    render(<GameGenreRadarChart ownedGames={null} />);

    expect(screen.getByTestId('chart-wrapper')).toBeTruthy();
    expect(screen.getByText('No genres found')).toBeTruthy();
  });

  it('renders RadarChart when data is available', () => {
    (useGenreRadarChart as jest.Mock).mockReturnValue({
      values: [600, 300],
      labels: ['Action\n600m', 'RPG\n300m'],
    });

    const { UNSAFE_getByType } = render(<GameGenreRadarChart ownedGames={null} />);
    expect(UNSAFE_getByType('RadarChart' as any)).toBeTruthy();
  });

  it('passes values and labels to RadarChart from hook', () => {
    (useGenreRadarChart as jest.Mock).mockReturnValue({
      values: [600, 300],
      labels: ['Action\n600m', 'RPG\n300m'],
    });
    const { UNSAFE_getByType } = render(<GameGenreRadarChart ownedGames={null} />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.data).toEqual([600, 300]);
    expect(radarChart.props.labels).toEqual(['Action\n600m', 'RPG\n300m']);
  });

  it('sets maxValue to the highest value in the dataset', () => {
    (useGenreRadarChart as jest.Mock).mockReturnValue({
      values: [600, 300],
      labels: ['Action\n600m', 'RPG\n300m'],
    });
    const { UNSAFE_getByType } = render(<GameGenreRadarChart ownedGames={null} />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.maxValue).toBe(600);
  });
});
