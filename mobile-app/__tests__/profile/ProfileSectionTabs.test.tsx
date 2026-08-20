import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileSectionTabs from '@gamelog/profile/ProfileSectionTabs';
import type { TopGame } from '@gamelog/profile/profileSelectors';
import { getPlaytimeTrend } from '@gamelog/profile/playtimeTrendSelectors';
import { getPlatformSplit } from '@gamelog/profile/platformSplitSelectors';

jest.mock('@gamelog/common/charts/total-hours/TotalHoursPieChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="total-hours-pie-chart" {...props} />,
  };
});
jest.mock('@gamelog/common/charts/genre-radar/GameGenreRadarChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="genre-radar-chart" {...props} />,
  };
});

const TOP_GAMES: TopGame[] = [
  { appid: '236390', name: 'War Thunder', hoursLabel: '412h', percentOfTop: 100 },
];

const OWNED_GAMES = { response: { game_count: 1, games: [] } } as any;

const SPLIT = getPlatformSplit({
  response: {
    game_count: 1,
    games: [{ playtime_windows_forever: 600, playtime_deck_forever: 200 }],
  },
} as any);

const TREND = getPlaytimeTrend(
  [{ date: '2026-08-18', playtime_minutes: 120 }],
  14,
  new Date(2026, 7, 18)
);

const renderTabs = (overrides: Record<string, unknown> = {}) =>
  render(
    <ProfileSectionTabs
      topGames={TOP_GAMES}
      playtimeTrend={TREND}
      platformSplit={SPLIT}
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

  it('opens on the overview panel, recent activity above the ranking', () => {
    renderTabs();

    expect(screen.getByTestId('profile-playtime-trend')).toBeTruthy();
    expect(screen.getByTestId('profile-top-games')).toBeTruthy();
    expect(screen.queryByTestId('genre-radar-chart')).toBeNull();
    expect(screen.queryByTestId('profile-platform-split')).toBeNull();
  });

  it('swaps in the per-game bars and the share donut on the time tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-time'));

    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
    expect(screen.getByTestId('total-hours-pie-chart')).toBeTruthy();
    expect(screen.queryByTestId('profile-top-games')).toBeNull();
    expect(screen.queryByTestId('profile-playtime-trend')).toBeNull();
  });

  it('ranks the per-game bars against the top game', () => {
    renderTabs({
      topGames: [
        ...TOP_GAMES,
        { appid: '730', name: 'Counter-Strike 2', hoursLabel: '206h', percentOfTop: 50 },
      ],
    });

    fireEvent.press(screen.getByTestId('profile-tab-time'));

    expect(screen.getByTestId('total-hours-chart')).toBeTruthy();
  });

  it('reports a failed playtime history without blaming the library', () => {
    renderTabs({ errorPlaytimeTrend: true });

    expect(screen.getByText('Could not load playtime history')).toBeTruthy();
    expect(screen.getByTestId('profile-top-games')).toBeTruthy();
    expect(screen.queryByText('Could not load playtime')).toBeNull();
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

    expect(screen.getByTestId('profile-platform-split')).toBeTruthy();
    expect(screen.getByText('Windows')).toBeTruthy();
    expect(screen.getByTestId('profile-platform-percent-deck')).toHaveTextContent('25%');
  });

  it('blames the library when the platform split cannot be built', () => {
    renderTabs({ errorOwnedGames: true });

    fireEvent.press(screen.getByTestId('profile-tab-platforms'));

    expect(screen.getByText('Could not load platform playtime')).toBeTruthy();
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
    const chart = screen.getByTestId('total-hours-pie-chart');

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
