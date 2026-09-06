import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import CommunityPlaytimeHistogramChart from '@gamelog/common/charts/community-playtime-histogram/CommunityPlaytimeHistogramChart';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  __esModule: true,
  default: {
    getCommunityWeeklyPlaytime: jest.fn(),
    getCommunityMonthlyPlaytime: jest.fn(),
  },
}));

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
    BarChart: (props: any) => <View testID="mock-bar-chart" {...props} />,
  };
});

const mockUseOrientation = jest.fn(() => ({ isLandscape: false }));
jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: () => mockUseOrientation(),
}));

describe('CommunityPlaytimeHistogramChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrientation.mockReturnValue({ isLandscape: false });
  });

  it('renders correctly with data in portrait mode', async () => {
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockResolvedValue({
      user: [1.5, 2.0, 0, 3.5, 1.0, 4.0, 0],
      community: [2.0, 1.5, 1.0, 2.5, 2.0, 3.0, 1.5],
    });

    render(<CommunityPlaytimeHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByTestId('community-playtime-histogram-chart')).toBeTruthy();
      expect(screen.getByTestId('mock-bar-chart')).toBeTruthy();
      expect(screen.getByText('You')).toBeTruthy();
      expect(screen.getByText('Others')).toBeTruthy();
      expect(screen.getByText('1W')).toBeTruthy();
      expect(screen.getByText('6M')).toBeTruthy();
      expect(screen.queryByText('2W')).toBeNull();
      expect(screen.queryByText('1Y')).toBeNull();
    });
  }, 10000);

  it('switches between 1W and 6M range options', async () => {
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockResolvedValue({
      user: [1, 2, 3, 4, 5, 6, 7],
      community: [2, 2, 2, 2, 2, 2, 2],
    });
    (ApiManager.getCommunityMonthlyPlaytime as jest.Mock).mockResolvedValue({
      user: [10, 20, 30, 40, 50, 60],
      community: [15, 25, 35, 45, 55, 65],
    });

    render(<CommunityPlaytimeHistogramChart scope="global" />);

    fireEvent.press(screen.getByText('6M'));

    await waitFor(() => {
      expect(ApiManager.getCommunityMonthlyPlaytime).toHaveBeenCalled();
    });
  });

  it('renders 2W, 6M, 1Y options and auto-selects 2W in landscape mode', async () => {
    mockUseOrientation.mockReturnValue({ isLandscape: true });
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockResolvedValue({
      user: [1, 2, 3, 4, 5, 6, 7],
      community: [2, 2, 2, 2, 2, 2, 2],
    });

    render(<CommunityPlaytimeHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.queryByText('1W')).toBeNull();
      expect(screen.getByText('2W')).toBeTruthy();
      expect(screen.getByText('6M')).toBeTruthy();
      expect(screen.getByText('1Y')).toBeTruthy();
      // Auto-selects 2W in landscape, calling getCommunityWeeklyPlaytime twice
      expect(ApiManager.getCommunityWeeklyPlaytime).toHaveBeenCalledTimes(2);
      const mockChart = screen.getByTestId('mock-bar-chart');
      // In landscape twoWeeks mode, barWidth is 14 and height is 200
      expect(mockChart.props.barWidth).toBe(14);
      expect(mockChart.props.height).toBe(200);
    });
  });

  it('allows manual selection of 1Y in landscape mode', async () => {
    mockUseOrientation.mockReturnValue({ isLandscape: true });
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockResolvedValue({
      user: [1, 2, 3, 4, 5, 6, 7],
      community: [2, 2, 2, 2, 2, 2, 2],
    });
    (ApiManager.getCommunityMonthlyPlaytime as jest.Mock).mockResolvedValue({
      user: Array(12).fill(10),
      community: Array(12).fill(12),
    });

    render(<CommunityPlaytimeHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByText('2W')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('1Y'));

    await waitFor(() => {
      expect(ApiManager.getCommunityMonthlyPlaytime).toHaveBeenCalled();
      const mockChart = screen.getByTestId('mock-bar-chart');
      // In landscape year mode, barWidth is 14
      expect(mockChart.props.barWidth).toBe(14);
    });
  });

  it('handles navigation chevrons', async () => {
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockResolvedValue({
      user: [1, 2, 3, 4, 5, 6, 7],
      community: [2, 2, 2, 2, 2, 2, 2],
    });

    render(<CommunityPlaytimeHistogramChart scope="global" />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-bar-chart')).toBeTruthy();
    });

    const prevBtn = screen.getByTestId('community-histogram-prev');
    fireEvent.press(prevBtn);

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyPlaytime).toHaveBeenCalledTimes(2);
    });
  });

  it('renders error behaviour on failure while keeping the date selector intact', async () => {
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockRejectedValue(
      new Error('User region is not set')
    );

    render(<CommunityPlaytimeHistogramChart scope="region" />);

    await waitFor(() => {
      expect(screen.getByText('User region is not set')).toBeTruthy();
      expect(screen.getByTestId('community-histogram-prev')).toBeTruthy();
      expect(screen.getByTestId('community-histogram-next')).toBeTruthy();
    });
  });

  it('renders skeletons on initial load and keeps date selector visible with spinner during date change', async () => {
    let resolveFirstFetch: (value: any) => void;
    const firstFetchPromise = new Promise((resolve) => {
      resolveFirstFetch = resolve;
    });

    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockReturnValue(firstFetchPromise);

    render(<CommunityPlaytimeHistogramChart scope="global" />);

    // Initial loading: total shimmers, date shimmer, spinner in chart area
    expect(screen.getByTestId('community-histogram-total-user-shimmer')).toBeTruthy();
    expect(screen.getByTestId('community-histogram-total-community-shimmer')).toBeTruthy();
    expect(screen.getByTestId('community-histogram-date-shimmer')).toBeTruthy();
    expect(screen.getByTestId('spinner')).toBeTruthy();
    expect(screen.getByTestId('community-histogram-prev')).toBeDisabled();

    // Resolve first fetch
    await act(async () => {
      resolveFirstFetch!({
        user: [1, 2, 3, 4, 5, 6, 7],
        community: [2, 2, 2, 2, 2, 2, 2],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-bar-chart')).toBeTruthy();
      expect(screen.queryByTestId('community-histogram-total-user-shimmer')).toBeNull();
      expect(screen.queryByTestId('community-histogram-date-shimmer')).toBeNull();
    });

    // Now trigger date navigation with delayed response
    let resolveSecondFetch: (value: any) => void;
    const secondFetchPromise = new Promise((resolve) => {
      resolveSecondFetch = resolve;
    });
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockReturnValue(secondFetchPromise);

    const prevBtn = screen.getByTestId('community-histogram-prev');
    fireEvent.press(prevBtn);

    // During date navigation:
    // 1. Date selector does NOT disappear and does NOT show shimmer (shows updated date)
    expect(screen.queryByTestId('community-histogram-date-shimmer')).toBeNull();
    expect(screen.getByTestId('community-histogram-prev')).toBeTruthy();
    expect(screen.getByTestId('community-histogram-prev')).toBeDisabled();
    // 2. Totals show shimmer
    expect(screen.getByTestId('community-histogram-total-user-shimmer')).toBeTruthy();
    expect(screen.getByTestId('community-histogram-total-community-shimmer')).toBeTruthy();
    // 3. Chart area shows spinner
    expect(screen.getByTestId('spinner')).toBeTruthy();
    expect(screen.queryByTestId('mock-bar-chart')).toBeNull();

    // Resolve second fetch
    await act(async () => {
      resolveSecondFetch!({
        user: [2, 3, 4, 5, 6, 7, 8],
        community: [3, 3, 3, 3, 3, 3, 3],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-bar-chart')).toBeTruthy();
      expect(screen.queryByTestId('spinner')).toBeNull();
      expect(screen.queryByTestId('community-histogram-total-user-shimmer')).toBeNull();
    });
  });
});
