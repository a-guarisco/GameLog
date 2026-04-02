import { render } from '@testing-library/react-native';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { computePieRadius, computePieInnerRadius } from '@gamelog/common/charts/chartsHelpers';
import buildOsShareData from '@gamelog/common/charts/os-share/buildOsShareData';

jest.mock('@gamelog/api-manager/useApi');
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

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;

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
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });

    const { getByTestId, UNSAFE_queryByType } = render(<OsShareChart />);

    expect(getByTestId('chart-wrapper')).toBeTruthy();
    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('passes error=true to ChartWrapperCard when there is an error', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: new Error('fail'),
    });

    const { UNSAFE_queryByType } = render(<OsShareChart />);

    expect(UNSAFE_queryByType('PieChart' as any)).toBeNull();
  });

  it('renders PieChart when data is available', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<OsShareChart />);

    expect(UNSAFE_getByType('PieChart' as any)).toBeTruthy();
  });

  it('calls useGetOwnedGames with the hardcoded userId and false', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });

    render(<OsShareChart />);

    expect(mockUseGetOwnedGames).toHaveBeenCalledWith('76561198077919169', false);
  });

  it('passes an empty pieData array when ownedGames is null', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<OsShareChart />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.data).toEqual([]);
  });

  it('passes an empty pieData array when ownedGames.response is missing', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: {},
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<OsShareChart />);

    expect(UNSAFE_getByType('PieChart' as any).props.data).toEqual([]);
  });

  it('derives radius and innerRadius from cardWidth via helpers', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<OsShareChart />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(computePieRadius).toHaveBeenCalledWith(300);
    expect(computePieInnerRadius).toHaveBeenCalledWith(100);
    expect(pie.props.radius).toBe(100);
    expect(pie.props.innerRadius).toBe(60);
  });

  it('sets innerCircleColor and textColor from the theme', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<OsShareChart />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.innerCircleColor).toBe('rgb(30,30,30)');
    expect(pie.props.textColor).toBe('rgb(255,255,255)');
  });

  it('memoizes pieData — buildOsShareData is not re-called on unrelated re-renders', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { rerender } = render(<OsShareChart />);
    const callsBefore = (buildOsShareData as jest.Mock).mock.calls.length;
    rerender(<OsShareChart />);

    expect((buildOsShareData as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});
