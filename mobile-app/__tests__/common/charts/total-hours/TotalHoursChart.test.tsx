import { render } from '@testing-library/react-native';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { useNavigation } from '@react-navigation/native';
import buildTotalHoursBarData from '@gamelog/common/charts/total-hours/buildTotalHoursBarData';

jest.mock('@gamelog/api-manager/useApi');
jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('react-native-gifted-charts', () => ({ BarChart: 'BarChart' }));
jest.mock('@gamelog/components/ui/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: (props: any) => <View {...props} /> };
});
jest.mock('@gamelog/common/charts/total-hours/buildTotalHoursBarData', () =>
  jest.fn(() => [
    { value: 10, appid: '42', frontColor: '#a', gradientColor: '#b', spacing: 12, label: 'Game A' },
  ])
);
jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">
      {!isLoading &&
        !error &&
        children({
          cardWidth: 400,
          theme: { '--color-typography-200': '200,200,200' },
        })}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

const mockUseGetOwnedGames = useGetOwnedGames as jest.Mock;
const mockUseNavigation = useNavigation as jest.Mock;

const OWNED_GAMES = {
  response: {
    game_count: 1,
    games: [
      {
        appid: '42',
        name: 'Game A',
        playtime_forever: 600,
        img_icon_url: '',
        has_community_visible_stats: false,
        playtime_windows_forever: 0,
        playtime_mac_forever: 0,
        playtime_linux_forever: 0,
        playtime_deck_forever: 0,
        rtime_last_played: 0,
      },
    ],
  },
};

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseNavigation.mockReturnValue({ navigate: mockNavigate });
});

describe('TotalHoursChart', () => {
  it('hides BarChart while data is loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });

    const { UNSAFE_queryByType } = render(<TotalHoursChart />);

    expect(UNSAFE_queryByType('BarChart' as any)).toBeNull();
  });

  it('hides BarChart when there is an error', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: new Error('fail'),
    });

    const { UNSAFE_queryByType } = render(<TotalHoursChart />);

    expect(UNSAFE_queryByType('BarChart' as any)).toBeNull();
  });

  it('renders BarChart when data is available', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursChart />);

    expect(UNSAFE_getByType('BarChart' as any)).toBeTruthy();
  });

  it('calls useGetOwnedGames with the hardcoded USER_ID and false', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });

    render(<TotalHoursChart />);

    expect(mockUseGetOwnedGames).toHaveBeenCalledWith('76561198077919169', false);
  });

  it('passes barData from buildTotalHoursBarData to BarChart', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursChart />);

    expect(UNSAFE_getByType('BarChart' as any).props.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ appid: '42' })])
    );
  });

  it('sets maxValue to the highest value in barData', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursChart />);

    expect(UNSAFE_getByType('BarChart' as any).props.maxValue).toBe(10);
  });

  it('derives axis colours from the theme', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursChart />);
    const bar = UNSAFE_getByType('BarChart' as any);

    expect(bar.props.xAxisColor).toBe('rgb(200,200,200)');
    expect(bar.props.yAxisTextStyle.color).toBe('rgb(200,200,200)');
    expect(bar.props.xAxisLabelTextStyle.color).toBe('rgb(200,200,200)');
  });

  it('sets parentWidth and container width to cardWidth - 30', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursChart />);

    expect(UNSAFE_getByType('BarChart' as any).props.parentWidth).toBe(370);
  });

  it('navigates to Game screen with the correct appid when a bar is pressed', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { UNSAFE_getByType } = render(<TotalHoursChart />);
    const bar = UNSAFE_getByType('BarChart' as any);

    bar.props.onPress({ value: 10, appid: '42', label: 'Game A' });

    expect(mockNavigate).toHaveBeenCalledWith('GameList', {
      screen: 'Game',
      params: { appid: '42' },
    });
  });

  it('memoizes barData — buildTotalHoursBarData is not re-called on unrelated re-renders', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: OWNED_GAMES,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    const { rerender } = render(<TotalHoursChart />);
    const callsBefore = (buildTotalHoursBarData as jest.Mock).mock.calls.length;
    rerender(<TotalHoursChart />);

    expect((buildTotalHoursBarData as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});
