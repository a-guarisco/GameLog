import { render, screen, fireEvent } from '@testing-library/react-native';
import CommunityGameStatusChart, {
  computeDonutRadius,
} from '@gamelog/common/charts/community-game-status/CommunityGameStatusChart';
import { useCommunityGameStatus } from '@gamelog/common/charts/community-game-status/useCommunityGameStatus';
import * as OrientationHook from '@gamelog/common/useOrientation';

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  const MockPieChart = ({ centerLabelComponent, ...props }: any) => (
    <View testID="mock-pie-chart" {...props}>
      {centerLabelComponent ? centerLabelComponent() : null}
    </View>
  );
  MockPieChart.displayName = 'MockPieChart';
  return {
    PieChart: MockPieChart,
  };
});

jest.mock('@gamelog/common/charts/community-game-status/useCommunityGameStatus', () => ({
  useCommunityGameStatus: jest.fn(),
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
            '--color-background-50': '255,255,255',
          },
        })
      )}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

describe('CommunityGameStatusChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders warning when backend returns error (e.g. 400 no region / no friends)', () => {
    (useCommunityGameStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: true,
      errorMessage: 'User region is not set',
    });

    render(<CommunityGameStatusChart scope="region" />);

    expect(screen.getByText('User region is not set')).toBeTruthy();
  });

  it('renders empty message when no game status data is returned', () => {
    (useCommunityGameStatus as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: false,
      errorMessage: null,
    });

    render(<CommunityGameStatusChart scope="global" />);

    expect(screen.getByText('No game status data found')).toBeTruthy();
  });

  it('renders 2 donut charts and explanation by default, and reveals breakdown bars and legend on toggle', () => {
    const mockData = {
      user: [
        { status: 'shelved', count: 0, percentage: 0 },
        { status: 'to_be_played', count: 17, percentage: 32.69 },
        { status: 'playing', count: 35, percentage: 67.31 },
        { status: 'platinato', count: 0, percentage: 0 },
      ],
      community: [
        { status: 'shelved', count: 0.2, percentage: 11.11 },
        { status: 'to_be_played', count: 0, percentage: 0 },
        { status: 'playing', count: 1.6, percentage: 88.89 },
        { status: 'platinato', count: 0, percentage: 0 },
      ],
      user_num_of_games: 52,
      community_num_of_games: 1.8,
    };

    (useCommunityGameStatus as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: false,
      errorMessage: null,
    });

    render(<CommunityGameStatusChart scope="global" />);

    // Check headings and center counts for the 2 donuts
    expect(screen.getByText('You')).toBeTruthy();
    expect(screen.getByText('Others (avg)')).toBeTruthy();
    expect(screen.getByText('52')).toBeTruthy();
    expect(screen.getByText('Games')).toBeTruthy();
    expect(screen.getByText('1.8')).toBeTruthy();
    expect(screen.getByText('Games avg')).toBeTruthy();

    // Check footer explanation sentence is outside and visible by default
    expect(
      screen.getByText('Comparing your game statuses with the global community.')
    ).toBeTruthy();

    // Breakdown items and "Others" legend should be hidden by default
    expect(screen.queryByText('Others')).toBeNull();
    expect(screen.queryByText('Playing')).toBeNull();
    expect(screen.queryByText('67.31%')).toBeNull();
    expect(screen.queryByTestId('user-status-progress-playing')).toBeNull();

    // Expand toggle button exists
    const toggleButton = screen.getByTestId('community-status-expand-toggle');
    expect(toggleButton).toBeTruthy();

    // Press to expand
    fireEvent.press(toggleButton);

    // Legend is now visible
    expect(screen.getByText('Others')).toBeTruthy();

    // Check status breakdown titles and percentages now visible
    expect(screen.getByText('Playing')).toBeTruthy();
    expect(screen.getByText('To Be Played')).toBeTruthy();
    expect(screen.getByText('Shelved')).toBeTruthy();
    expect(screen.getByText('Platinato')).toBeTruthy();

    expect(screen.getByText('67.31%')).toBeTruthy();
    expect(screen.getByText('88.89%')).toBeTruthy();
    expect(screen.getByText('32.69%')).toBeTruthy();
    expect(screen.getByText('11.11%')).toBeTruthy();

    expect(screen.getByTestId('user-status-progress-playing')).toBeTruthy();
    expect(screen.getByTestId('others-status-progress-playing')).toBeTruthy();

    // Press to collapse again
    fireEvent.press(toggleButton);

    expect(screen.queryByText('Others')).toBeNull();
    expect(screen.queryByText('Playing')).toBeNull();
    expect(screen.queryByText('67.31%')).toBeNull();
    expect(screen.queryByTestId('user-status-progress-playing')).toBeNull();
  });

  it('renders targetUserName with numberOfLines={2} for donut title and legend', () => {
    (useCommunityGameStatus as jest.Mock).mockReturnValue({
      data: {
        user: [{ status: 'playing', count: 5, percentage: 100 }],
        community: [{ status: 'playing', count: 5, percentage: 100 }],
        user_num_of_games: 5,
        community_num_of_games: 5,
      },
      isLoading: false,
      error: false,
      errorMessage: null,
    });

    render(
      <CommunityGameStatusChart
        scope="user"
        targetUserId="user-123"
        targetUserName="DeadSkorpioProGamerMC"
      />
    );

    const donutTitle = screen.getByText('DeadSkorpioProGamerMC');
    expect(donutTitle).toBeTruthy();
    expect(donutTitle.props.numberOfLines).toBe(2);

    // Expand toggle to verify legend
    fireEvent.press(screen.getByTestId('community-status-expand-toggle'));
    const legendItems = screen.getAllByText('DeadSkorpioProGamerMC');
    expect(legendItems.length).toBeGreaterThanOrEqual(2);
    expect(legendItems[1].props.numberOfLines).toBe(2);
  });

  describe('computeDonutRadius', () => {
    it('caps radius at 68 for phone portrait even when card width is large', () => {
      expect(computeDonutRadius(600, false, false)).toBe(68);
    });

    it('caps radius at 76 for landscape on both phone and tablet', () => {
      expect(computeDonutRadius(600, true, false)).toBe(76);
      expect(computeDonutRadius(800, true, true)).toBe(76);
    });

    it('caps radius at 120 for tablet portrait', () => {
      expect(computeDonutRadius(800, false, true)).toBe(120);
    });

    it('enforces minimum radius of 48', () => {
      expect(computeDonutRadius(100, false, false)).toBe(48);
      expect(computeDonutRadius(100, false, true)).toBe(48);
    });
  });

  describe('Tablet portrait layout', () => {
    it('scales up typography and donut size on tablet portrait', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: true,
        width: 768,
        height: 1024,
      });

      (useCommunityGameStatus as jest.Mock).mockReturnValue({
        data: {
          user: [{ status: 'playing', count: 5, percentage: 100 }],
          community: [{ status: 'playing', count: 5, percentage: 100 }],
          user_num_of_games: 42,
          community_num_of_games: 10,
        },
        isLoading: false,
        error: false,
        errorMessage: null,
      });

      render(<CommunityGameStatusChart scope="global" />);

      const countText = screen.getByText('42');
      expect(countText).toBeTruthy();
      expect(countText.props.style).toEqual(
        expect.objectContaining({ fontSize: 28, lineHeight: 32 })
      );

      const subtitleTexts = screen.getAllByText('Games');
      expect(subtitleTexts[0].props.style).toEqual(
        expect.objectContaining({ fontSize: 13, lineHeight: 16 })
      );

      const titleText = screen.getByText('You');
      expect(titleText.props.className).toContain('text-base');

      // Expand to verify horizontal bars text scaling on tablet portrait
      fireEvent.press(screen.getByTestId('community-status-expand-toggle'));
      const statusTitle = screen.getByText('Playing');
      expect(statusTitle.props.className).toContain('text-sm');

      const percentTexts = screen.getAllByText('100%');
      expect(percentTexts[0].props.className).toContain('text-sm');
      expect(percentTexts[0].props.className).toContain('w-16');
    });

    it('keeps standard typography on phone portrait', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: false,
        width: 375,
        height: 812,
      });

      (useCommunityGameStatus as jest.Mock).mockReturnValue({
        data: {
          user: [{ status: 'playing', count: 5, percentage: 100 }],
          community: [{ status: 'playing', count: 5, percentage: 100 }],
          user_num_of_games: 42,
          community_num_of_games: 10,
        },
        isLoading: false,
        error: false,
        errorMessage: null,
      });

      render(<CommunityGameStatusChart scope="global" />);

      const countText = screen.getByText('42');
      expect(countText.props.style).toEqual(
        expect.objectContaining({ fontSize: 20, lineHeight: 24 })
      );

      const subtitleTexts = screen.getAllByText('Games');
      expect(subtitleTexts[0].props.style).toEqual(
        expect.objectContaining({ fontSize: 10, lineHeight: 12 })
      );

      const titleText = screen.getByText('You');
      expect(titleText.props.className).toContain('text-sm');

      // Expand to verify horizontal bars text on phone portrait
      fireEvent.press(screen.getByTestId('community-status-expand-toggle'));
      const statusTitle = screen.getByText('Playing');
      expect(statusTitle.props.className).toContain('text-xs');

      const percentTexts = screen.getAllByText('100%');
      expect(percentTexts[0].props.className).toContain('text-xs');
      expect(percentTexts[0].props.className).toContain('w-14');
    });

    it('scales horizontal bar text to sm on tablet landscape as well', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: true,
        isTablet: true,
        width: 1024,
        height: 768,
      });

      (useCommunityGameStatus as jest.Mock).mockReturnValue({
        data: {
          user: [{ status: 'playing', count: 5, percentage: 100 }],
          community: [{ status: 'playing', count: 5, percentage: 100 }],
          user_num_of_games: 42,
          community_num_of_games: 10,
        },
        isLoading: false,
        error: false,
        errorMessage: null,
      });

      render(<CommunityGameStatusChart scope="global" />);

      // Expand to verify horizontal bars text on tablet landscape
      fireEvent.press(screen.getByTestId('community-status-expand-toggle'));
      const statusTitle = screen.getByText('Playing');
      expect(statusTitle.props.className).toContain('text-sm');

      const percentTexts = screen.getAllByText('100%');
      expect(percentTexts[0].props.className).toContain('text-sm');
      expect(percentTexts[0].props.className).toContain('w-16');
    });
  });
});
