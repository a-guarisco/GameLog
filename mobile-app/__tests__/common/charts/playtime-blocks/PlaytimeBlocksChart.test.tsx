import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import PlaytimeBlocksChart from '@gamelog/common/charts/playtime-blocks/PlaytimeBlocksChart';

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
          {children({ cardWidth: 350, theme: { '--color-typography-200': '0,0,0', '--color-primary-500': '255,0,0' } })}
        </View>
      );
    },
  };
});

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BarChart: ({ onScroll }: any) => (
      <View
        testID="mock-bar-chart"
        onScroll={(e: any) => onScroll && onScroll(e)}
      />
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
  const MOCK_TODAY = new Date('2023-10-18T12:00:00Z'); // A Wednesday, so -1 is in the same week

  const getOffsetDateString = (offsetDays: number) => {
    const d = new Date(MOCK_TODAY);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const mockPlaytimeByUser = [
    { date: getOffsetDateString(0), playtime_minutes: 120 },
    { date: getOffsetDateString(-1), playtime_minutes: 60 },
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
});
