import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileSectionTabs from '@gamelog/profile/ProfileSectionTabs';
import { selectPlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';

jest.mock('@gamelog/common/charts/total-hours/TotalHoursDoughnut', () => {
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
jest.mock('@gamelog/common/charts/playtime-trend/PlaytimeTrendChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="profile-playtime-trend" {...props} />,
  };
});
jest.mock('@gamelog/common/charts/platform-split/PlatformSplitChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="profile-platform-split" {...props} />,
  };
});
jest.mock('@gamelog/report/ReportBox', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    ReportBox: (props: any) => <View testID="report-box" {...props} />,
  };
});
jest.mock('@gamelog/profile/tabs/ProfileTimeTab', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="profile-time-tab" {...props} />,
  };
});

const OWNED_GAMES = { response: { game_count: 1, games: [] } } as any;

const SPLIT = selectPlatformSplit({
  response: {
    game_count: 1,
    games: [{ playtime_windows_forever: 600, playtime_deck_forever: 200 }],
  },
} as any);

const renderTabs = (overrides: Record<string, unknown> = {}) =>
  render(
    <ProfileSectionTabs
      playtimeTrend={{
        days: [],
        averageLabel: '0h',
        totalLabel: '0h',
        previousTotalMinutes: 0,
        hasPlaytime: false,
      }}
      platformSplit={SPLIT}
      ownedGames={OWNED_GAMES}
      playtimeByUser={null}
      userId="123"
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

  it('opens on the overview panel, showing PlaytimeTrend and ReportBox', () => {
    renderTabs();

    expect(screen.getByTestId('profile-playtime-trend')).toBeTruthy();
    expect(screen.getByTestId('report-box')).toBeTruthy();
    expect(screen.queryByTestId('genre-radar-chart')).toBeNull();
    expect(screen.queryByTestId('profile-platform-split')).toBeNull();
  });

  it('swaps in the time tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-time'));

    expect(screen.getByTestId('profile-time-tab')).toBeTruthy();
    expect(screen.queryByTestId('report-box')).toBeNull();
    expect(screen.queryByTestId('profile-playtime-trend')).toBeNull();
  });

  it('swaps in the genre radar on the genres tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-genres'));

    expect(screen.getByTestId('genre-radar-chart')).toBeTruthy();
    expect(screen.queryByTestId('report-box')).toBeNull();
  });

  it('swaps in the platform split on the platforms tab', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('profile-tab-platforms'));

    expect(screen.getByTestId('profile-platform-split')).toBeTruthy();
  });
});
