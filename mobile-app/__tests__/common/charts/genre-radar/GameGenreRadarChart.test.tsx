import { render, screen } from '@testing-library/react-native';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';

jest.mock('react-native-gifted-charts', () => ({ RadarChart: 'RadarChart' }));
jest.mock('@gamelog/utils/formatUtils', () => ({
  formatMinutesToHours: jest.fn((m) => `${m}m`),
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">{!isLoading && !error && children({ theme: 'dark' })}</View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

jest.mock('@gamelog/common/charts/ExternalLabelBox', () => {
  const { View } = jest.requireActual('react-native');
  const MockExternalLabelBox = (props: any) => <View testID="external-label-box" />;

  MockExternalLabelBox.displayName = 'MockExternalLabelBox';
  return MockExternalLabelBox;
});

const GENRE_DATA = [
  { label: 'Action', value: 600, color: '#aaa' },
  { label: 'RPG', value: 300, color: '#bbb' },
];

beforeEach(() => jest.clearAllMocks());

describe('GameGenreRadarChart', () => {
  it('renders ChartWrapperCard in a loading state when data is loading', () => {
    render(<GameGenreRadarChart genreChartData={[]} isLoadingGenreChart={true} />);

    expect(screen.getByTestId('chart-wrapper')).toBeTruthy();
    expect(screen.queryByTestId('external-label-box')).toBeNull();
  });

  it('renders ChartWrapperCard in an error state when there is an error', () => {
    render(<GameGenreRadarChart genreChartData={[]} errorGenreChart={new Error('fetch failed')} />);

    expect(screen.getByTestId('chart-wrapper')).toBeTruthy();
    expect(screen.queryByTestId('external-label-box')).toBeNull();
  });

  it('renders RadarChart and ExternalLabelBox when data is available', () => {
    render(<GameGenreRadarChart genreChartData={GENRE_DATA} />);

    expect(screen.getByTestId('external-label-box')).toBeTruthy();
  });

  it('derives numeric values and labels from genreChartData', () => {
    const { UNSAFE_getByType } = render(<GameGenreRadarChart genreChartData={GENRE_DATA} />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.data).toEqual([600, 300]);
    expect(radarChart.props.labels).toEqual(['Action', 'RPG']);
  });

  it('sets maxValue to the highest value in the dataset', () => {
    const { UNSAFE_getByType } = render(<GameGenreRadarChart genreChartData={GENRE_DATA} />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.maxValue).toBe(600);
  });

  it('coerces non-numeric values to 0', () => {
    const { UNSAFE_getByType } = render(
      <GameGenreRadarChart genreChartData={[{ label: 'Unknown', value: NaN, color: '#ccc' }]} />
    );
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.data).toEqual([0]);
  });
});
