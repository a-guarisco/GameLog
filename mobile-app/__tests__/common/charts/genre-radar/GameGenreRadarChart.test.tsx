import { render, screen } from '@testing-library/react-native';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import { useGetGameGenreChartData } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi');
jest.mock('react-native-gifted-charts', () => ({ RadarChart: 'RadarChart' }));
jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  formatMinutes: jest.fn((m) => `${m}m`),
}));
jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = require('react-native');
  return ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">{!isLoading && !error && children({ theme: 'dark' })}</View>
  );
});
jest.mock('@gamelog/common/charts/ExternalLabelBox', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="external-label-box" />;
});

const mockUseGetGameGenreChartData = useGetGameGenreChartData as jest.Mock;

const GENRE_DATA = [
  { label: 'Action', value: 600, color: '#aaa' },
  { label: 'RPG', value: 300, color: '#bbb' },
];

beforeEach(() => jest.clearAllMocks());

describe('GameGenreRadarChart', () => {
  it('renders ChartWrapperCard in a loading state when data is loading', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: [],
      isLoadingGenreChart: true,
      errorGenreChart: null,
    });

    render(<GameGenreRadarChart />);

    expect(screen.getByTestId('chart-wrapper')).toBeTruthy();
    expect(screen.queryByTestId('external-label-box')).toBeNull();
  });

  it('renders ChartWrapperCard in an error state when there is an error', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: [],
      isLoadingGenreChart: false,
      errorGenreChart: new Error('fetch failed'),
    });

    render(<GameGenreRadarChart />);

    expect(screen.getByTestId('chart-wrapper')).toBeTruthy();
    expect(screen.queryByTestId('external-label-box')).toBeNull();
  });

  it('renders RadarChart and ExternalLabelBox when data is available', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: GENRE_DATA,
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });

    render(<GameGenreRadarChart />);

    expect(screen.getByTestId('external-label-box')).toBeTruthy();
  });

  it('passes the correct user_id to the hook', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: [],
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });

    render(<GameGenreRadarChart />);

    expect(mockUseGetGameGenreChartData).toHaveBeenCalledWith('76561198077919169');
  });

  it('derives numeric values and labels from genreChartData', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: GENRE_DATA,
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });

    const { UNSAFE_getByType } = render(<GameGenreRadarChart />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.data).toEqual([600, 300]);
    expect(radarChart.props.labels).toEqual(['Action', 'RPG']);
  });

  it('sets maxValue to the highest value in the dataset', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: GENRE_DATA,
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });

    const { UNSAFE_getByType } = render(<GameGenreRadarChart />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.maxValue).toBe(600);
  });

  it('coerces non-numeric values to 0', () => {
    mockUseGetGameGenreChartData.mockReturnValue({
      genreChartData: [{ label: 'Unknown', value: NaN, color: '#ccc' }],
      isLoadingGenreChart: false,
      errorGenreChart: null,
    });

    const { UNSAFE_getByType } = render(<GameGenreRadarChart />);
    const radarChart = UNSAFE_getByType('RadarChart' as any);

    expect(radarChart.props.data).toEqual([0]);
  });
});
