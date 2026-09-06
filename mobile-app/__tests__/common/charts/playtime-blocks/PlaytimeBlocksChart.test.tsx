import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PlaytimeBlocksChart from '@gamelog/common/charts/playtime-blocks/PlaytimeBlocksChart';
import { toIsoDate } from '@gamelog/utils/formatUtils';

// We mock the ChartWrapperCard so we can trigger the layout event
jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ children, isLoading, error, ErrorBehaviour, testID, headerRight }: any) => {
      if (error) return <ErrorBehaviour />;
      return (
        <View testID={testID}>
          {headerRight}
          {children({
            cardWidth: 350,
            theme: { '--color-typography-200': '0,0,0', '--color-primary-500': '255,0,0' },
          })}
        </View>
      );
    },
  };
});

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BarChart: ({ onScroll }: any) => (
      <View testID="mock-bar-chart" onScroll={(e: any) => onScroll && onScroll(e)} />
    ),
  };
});

jest.mock('@gamelog/common/charts/playtime-blocks/useChartScrollShimmer', () => ({
  useChartScrollShimmer: () => ({
    isScrolling: false,
    setIsScrolling: jest.fn(),
    shimmerAnim: { interpolate: jest.fn() },
  }),
}));

describe('PlaytimeBlocksChart', () => {
  const MOCK_TODAY = new Date('2023-10-15T12:00:00Z');

  const mockPlaytimeByUser = [
    { date: '2023-10-15', playtime_minutes: 120 },
    { date: '2023-10-14', playtime_minutes: 60 },
  ];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(MOCK_TODAY);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders correctly with playtime data', () => {
    render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    expect(screen.getByTestId('playtime-blocks-chart')).toBeTruthy();
    expect(screen.getByTestId('mock-bar-chart')).toBeTruthy();

    expect(screen.getByText(/Played 2 of 7 days/)).toBeTruthy();
  });

  it('handles empty playtime data', () => {
    render(<PlaytimeBlocksChart playtimeByUser={[]} />);

    expect(screen.getByText(/No playtime for the selected week/)).toBeTruthy();
  });

  it('switches between week and 14D range', () => {
    render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    fireEvent.press(screen.getByText('14D'));

    expect(screen.getByText(/Played 2 days of 14/)).toBeTruthy();
  });

  it('triggers onScroll handler in 14D mode', async () => {
    render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    fireEvent.press(screen.getByText('14D'));

    const chart = screen.getByTestId('mock-bar-chart');
    fireEvent.scroll(chart, {
      nativeEvent: { contentOffset: { x: 50 } },
    });

    await waitFor(() => {
      expect(screen.getByText(/Played 2 days of 14/)).toBeTruthy();
    });
  });

  it('renders portrait options (Week, 14D) by default and does not show 30D', () => {
    render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    expect(screen.getByText('Week')).toBeTruthy();
    expect(screen.getByText('14D')).toBeTruthy();
    expect(screen.queryByText('30D')).toBeNull();
  });

  it('expands range options to include 30D in landscape mode', () => {
    const OrientationHook = require('@gamelog/common/useOrientation');
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      width: 844,
      height: 390,
    });

    render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    expect(screen.getByText('Week')).toBeTruthy();
    expect(screen.getByText('14D')).toBeTruthy();
    expect(screen.getByText('30D')).toBeTruthy();
  });

  it('switches to 30D range and displays days of 30 in landscape mode', () => {
    const OrientationHook = require('@gamelog/common/useOrientation');
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      width: 844,
      height: 390,
    });

    render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    fireEvent.press(screen.getByText('30D'));

    expect(screen.getByText(/Played 2 days of 30/)).toBeTruthy();
  });

  it('preserves manual selection across orientation change, falling back from 30D to 14D in portrait', () => {
    const OrientationHook = require('@gamelog/common/useOrientation');
    const spy = jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      width: 844,
      height: 390,
    });

    const { rerender } = render(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    // User explicitly selects 30D in landscape
    fireEvent.press(screen.getByText('30D'));
    expect(screen.getByText(/Played 2 days of 30/)).toBeTruthy();

    // Rotate back to portrait
    spy.mockReturnValue({
      isLandscape: false,
      width: 390,
      height: 844,
    });

    rerender(<PlaytimeBlocksChart playtimeByUser={mockPlaytimeByUser} />);

    // In portrait, 30D is not available so it falls back to 14D
    expect(screen.getByText(/Played 2 days of 14/)).toBeTruthy();
  });
});
