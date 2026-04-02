import { render } from '@testing-library/react-native';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';

jest.mock('@gamelog/api-manager/useApi');
jest.mock('react-native-gifted-charts', () => ({ PieChart: 'PieChart' }));

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: (props: any) => <View {...props} /> };
});

jest.mock('@gamelog/common/gluestack/text', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text };
});

jest.mock('@gamelog/common/charts/ExternalLabelBox', () => {
  const { View } = jest.requireActual('react-native');
  const MockExternalLabelBox = (props: any) => <View testID="external-label-box" />;

  MockExternalLabelBox.displayName = 'MockExternalLabelBox';
  return MockExternalLabelBox;
});

jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  computePieRadius: jest.fn(() => 100),
  computePieInnerRadius: jest.fn(() => 50),
}));

jest.mock('@gamelog/utils/formatUtils', () => ({
  formatMinutesToHours: jest.fn((m) => `${m}m`),
}));

jest.mock('@gamelog/common/charts/total-hours/buildTotalHoursPieData', () => ({
  __esModule: true,
  default: jest.fn(() => [
    { value: 60, label: 'Game A', color: '#a' },
    { value: 40, label: 'Game B', color: '#b' },
  ]),
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">
      {!isLoading &&
        !error &&
        children({
          cardWidth: 400,
          theme: {
            '--color-typography-200': '200,200,200',
            '--color-typography-100': '100,100,100',
            '--color-background-100': '0,0,0',
          },
        })}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;

const OWNED_GAMES = {
  response: { game_count: 2, games: [] },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TotalHoursPieChart', () => {
  it('hides PieChart while loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });

    const { UNSAFE_queryByType } = render(<TotalHoursPieChart />);

    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('hides PieChart on error', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: new Error('fail'),
    });

    const { UNSAFE_queryByType } = render(<TotalHoursPieChart />);

    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('renders PieChart when data is available', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursPieChart />);

    expect(UNSAFE_getByType('PieChart' as any)).toBeTruthy();
  });

  it('calls useGetOwnedGames with USER_ID and false', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });

    render(<TotalHoursPieChart />);

    expect(mockUseGetOwnedGames).toHaveBeenCalledWith('76561198077919169', false);
  });

  it('derives colors from theme', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursPieChart />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.textColor).toBe('rgb(200,200,200)');
    expect(pie.props.innerCircleColor).toBe('rgb(0,0,0)');
  });

  it('renders ExternalLabelBox with formatted labels', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { getByTestId } = render(<TotalHoursPieChart />);

    expect(getByTestId('external-label-box')).toBeTruthy();
  });

  it('formats tooltip label correctly', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursPieChart />);
    const pie = UNSAFE_getByType('PieChart' as any);

    const tooltip = pie.props.tooltipComponent(0);

    expect(formatMinutesToHours).toHaveBeenCalledWith(60);
    expect(tooltip.props.children.join('')).toContain('Game A');
  });
});
