import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileSectionTabs from '@gamelog/profile/ProfileSectionTabs';
import type { TopGame } from '@gamelog/profile/profileSelectors';

jest.mock('@gamelog/common/charts/total-hours/TotalHoursChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="total-hours-chart" {...props} />,
  };
});
jest.mock('@gamelog/common/charts/total-hours/TotalHoursPieChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="total-hours-pie-chart" /> };
});
jest.mock('@gamelog/common/charts/genre-radar/GameGenreRadarChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="genre-radar-chart" {...props} />,
  };
});
jest.mock('@gamelog/common/charts/os-share/OsShareChart', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="os-share-chart" /> };
});

const TOP_GAMES: TopGame[] = [
  { appid: '236390', name: 'War Thunder', hoursLabel: '412h', percentOfTop: 100 },
];

const OWNED_GAMES = { response: { game_count: 1, games: [] } } as any;

const renderTabs = (overrides: Record<string, unknown> = {}) =>
  render(
    <ProfileSectionTabs
      topGames={TOP_GAMES}
      ownedGames={OWNED_GAMES}
      genreChartData={[{ label: 'Action', value: 10 }]}
      {...overrides}
    />
  );

describe('ProfileSectionTabs', () => {
  it('renders all four tabs', () => {
    renderTabs();

    ['Overview', 'Time', 'Genres', 'Platforms'].forEach((label) =>
      expect(screen.getByText(label)).toBeTruthy()
    );
  });

  it('opens on the overview panel', () => {
    renderTabs();

    expect(screen.getByTestId('profile-top-games')).toBeTruthy();
    expect(screen.queryByTestId('total-hours-chart')).toBeNull();
    expect(screen.queryByTestId('genre-radar-chart')).toBeNull();
    expect(screen.queryByTestId('os-share-chart')).toBeNull();
  });

  it('swaps in both playtime charts on the time tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-time'));

    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
    expect(screen.getByTestId('total-hours-pie-chart')).toBeTruthy();
    expect(screen.queryByTestId('profile-top-games')).toBeNull();
  });

  it('swaps in the genre radar on the genres tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-genres'));

    expect(screen.getByTestId('genre-radar-chart')).toBeTruthy();
    expect(screen.queryByTestId('profile-top-games')).toBeNull();
  });

  it('swaps in the platform split on the platforms tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-platforms'));

    expect(screen.getByTestId('os-share-chart')).toBeTruthy();
  });

  it('goes back to the overview panel', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-time'));
    fireEvent.press(screen.getByTestId('profile-tab-overview'));

    expect(screen.getByTestId('profile-top-games')).toBeTruthy();
  });

  it('reports a failed library on the overview panel', () => {
    renderTabs({ topGames: [], errorOwnedGames: true });

    expect(screen.getByText('Could not load playtime')).toBeTruthy();
  });

  it('lets the page own the loading state so charts only render or fail', () => {
    renderTabs({ errorOwnedGames: true });

    fireEvent.press(screen.getByTestId('profile-tab-time'));
    const chart = screen.getByTestId('total-hours-chart');

    expect(chart.props.isLoadingOwnedGames).toBe(false);
    expect(chart.props.errorOwnedGames).toBe(true);
  });

  it('passes the genre data straight through to the radar', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-genres'));

    expect(screen.getByTestId('genre-radar-chart').props.genreChartData).toEqual([
      { label: 'Action', value: 10 },
    ]);
  });
});
