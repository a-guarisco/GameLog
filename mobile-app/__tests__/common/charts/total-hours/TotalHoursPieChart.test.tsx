import { render } from '@testing-library/react-native';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';

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

const OWNED_GAMES = {
  response: { game_count: 2, games: [] },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TotalHoursPieChart', () => {
  it('hides PieChart while loading', () => {
    const { UNSAFE_queryByType } = render(
      <TotalHoursPieChart ownedGames={null} isLoadingOwnedGames={true} />
    );

    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('hides PieChart on error', () => {
    const { UNSAFE_queryByType } = render(
      <TotalHoursPieChart ownedGames={null} errorOwnedGames={new Error('fail')} />
    );

    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('renders PieChart when data is available', () => {
    const { UNSAFE_getByType } = render(<TotalHoursPieChart ownedGames={OWNED_GAMES} />);

    expect(UNSAFE_getByType('PieChart' as any)).toBeTruthy();
  });

  it('derives colors from theme', () => {
    const { UNSAFE_getByType } = render(<TotalHoursPieChart ownedGames={OWNED_GAMES} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.textColor).toBe('rgb(200,200,200)');
    expect(pie.props.innerCircleColor).toBe('rgb(0,0,0)');
  });

  it('renders ExternalLabelBox with formatted labels', () => {
    const { getByTestId } = render(<TotalHoursPieChart ownedGames={OWNED_GAMES} />);

    expect(getByTestId('external-label-box')).toBeTruthy();
  });

  it('formats tooltip label correctly', () => {
    const { UNSAFE_getByType } = render(<TotalHoursPieChart ownedGames={OWNED_GAMES} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    const tooltip = pie.props.tooltipComponent(0);

    expect(formatMinutesToHours).toHaveBeenCalledWith(60);
    expect(tooltip.props.children.join('')).toContain('Game A');
  });
});
