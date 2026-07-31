import { render } from '@testing-library/react-native';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import { computePieRadius, computePieInnerRadius } from '@gamelog/common/charts/chartsHelpers';
import buildOsShareData from '@gamelog/common/charts/os-share/buildOsShareData';

jest.mock('react-native-gifted-charts', () => ({ PieChart: 'PieChart' }));
jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  computePieRadius: jest.fn(() => 100),
  computePieInnerRadius: jest.fn(() => 60),
}));
jest.mock('@gamelog/common/charts/os-share/buildOsShareData', () =>
  jest.fn(() => [{ value: 2, text: 'Windows: 2h', color: '#win' }])
);
jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');

  const MockChartWrapperCard = ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">
      {!isLoading &&
        !error &&
        children({
          cardWidth: 300,
          theme: { '--color-typography-200': '255,255,255', '--color-background-100': '30,30,30' },
        })}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';

  return MockChartWrapperCard;
});

const OWNED_GAMES = {
  response: {
    game_count: 1,
    games: [
      {
        appid: '1',
        name: 'Game',
        playtime_windows_forever: 120,
        playtime_forever: 120,
        img_icon_url: '',
        has_community_visible_stats: false,
        playtime_mac_forever: 0,
        playtime_linux_forever: 0,
        playtime_deck_forever: 0,
        rtime_last_played: 0,
      },
    ],
  },
};

beforeEach(() => jest.clearAllMocks());

describe('OsShareChart', () => {
  it('passes isLoading=true to ChartWrapperCard while data is loading', () => {
    const { getByTestId, UNSAFE_queryByType } = render(
      <OsShareChart ownedGames={null} isLoadingOwnedGames={true} />
    );

    expect(getByTestId('chart-wrapper')).toBeTruthy();
    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('passes error=true to ChartWrapperCard when there is an error', () => {
    const { UNSAFE_queryByType } = render(
      <OsShareChart ownedGames={null} errorOwnedGames={new Error('fail')} />
    );

    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('renders PieChart when data is available', () => {
    const { UNSAFE_getByType } = render(<OsShareChart ownedGames={OWNED_GAMES} />);

    expect(UNSAFE_getByType('PieChart' as any)).toBeTruthy();
  });

  it('passes an empty pieData array when ownedGames is null', () => {
    const { UNSAFE_getByType } = render(<OsShareChart ownedGames={null} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.data).toEqual([]);
  });

  it('passes an empty pieData array when ownedGames.response is missing', () => {
    const { UNSAFE_getByType } = render(<OsShareChart ownedGames={{}} />);

    expect(UNSAFE_getByType('PieChart' as any).props.data).toEqual([]);
  });

  it('derives radius and innerRadius from cardWidth via helpers', () => {
    const { UNSAFE_getByType } = render(<OsShareChart ownedGames={OWNED_GAMES} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(computePieRadius).toHaveBeenCalledWith(300);
    expect(computePieInnerRadius).toHaveBeenCalledWith(100);
    expect(pie.props.radius).toBe(100);
    expect(pie.props.innerRadius).toBe(60);
  });

  it('sets innerCircleColor and textColor from the theme', () => {
    const { UNSAFE_getByType } = render(<OsShareChart ownedGames={OWNED_GAMES} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.innerCircleColor).toBe('rgb(30,30,30)');
    expect(pie.props.textColor).toBe('rgb(255,255,255)');
  });

  it('memoizes pieData — buildOsShareData is not re-called on unrelated re-renders', () => {
    const { rerender } = render(<OsShareChart ownedGames={OWNED_GAMES} />);
    const callsBefore = (buildOsShareData as jest.Mock).mock.calls.length;
    rerender(<OsShareChart ownedGames={OWNED_GAMES} />);

    expect((buildOsShareData as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});
