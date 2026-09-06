import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
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
  });

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

    const prevBtn = screen.getByTestId('community-histogram-prev');
    fireEvent.press(prevBtn);

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyPlaytime).toHaveBeenCalledTimes(2);
    });
  });

  it('renders error behaviour on failure', async () => {
    (ApiManager.getCommunityWeeklyPlaytime as jest.Mock).mockRejectedValue(
      new Error('User region is not set')
    );

    render(<CommunityPlaytimeHistogramChart scope="region" />);

    await waitFor(() => {
      expect(screen.getByText('User region is not set')).toBeTruthy();
    });
  });
});
