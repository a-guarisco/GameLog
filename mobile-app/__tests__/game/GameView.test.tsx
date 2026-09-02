import { fireEvent, render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';
import { useGetPlaytimeReport } from '@gamelog/api-manager/useApi';
import { formatShortDateWithYear } from '@gamelog/utils/formatUtils';

import * as OrientationHook from '@gamelog/common/useOrientation';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// Only the playtime report is stubbed: every other hook is left to run against the
// mocked fetch layer, as the rest of this suite already relies on.
jest.mock('@gamelog/api-manager/useApi', () => ({
  ...jest.requireActual('@gamelog/api-manager/useApi'),
  useGetPlaytimeReport: jest.fn(),
}));

const mockUseGetPlaytimeReport = useGetPlaytimeReport as jest.Mock;

const mockReport = (state: Record<string, unknown> = {}) =>
  mockUseGetPlaytimeReport.mockReturnValue({
    playtimeReport: {
      date: '2026-08-18',
      game_reports: [
        { app_id: '123', today_play_time: 195, streak: 2 },
        { app_id: '999', today_play_time: 600, streak: 5 },
      ],
    },
    isLoadingPlaytimeReport: false,
    errorPlaytimeReport: null,
    ...state,
  });

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: jest.fn(),
  }),
  useRoute: jest.fn(() => ({
    params: {
      gameItem: {
        appid: '123',
        name: 'Test Game',
        playtime_forever: 100,
        img_icon_url: 'http://example.com/icon.png',
        has_community_visible_stats: true,
        playtime_windows_forever: 50,
        playtime_mac_forever: 30,
        playtime_linux_forever: 20,
        playtime_deck_forever: 0,
        rtime_last_played: 1620000000,
      },
    },
  })),
}));

jest.mock('@gamelog/game/GlobalAchievementsPreview', () => {
  const { Text, Pressable } = jest.requireActual<typeof import('react-native')>('react-native');
  const GlobalAchievementsPreview = ({ gameID, onSeeAll }: any) => (
    <Pressable onPress={onSeeAll} testID="mock-global-achievements">
      <Text>Mock Achievements for {gameID}</Text>
    </Pressable>
  );
  return GlobalAchievementsPreview;
});

describe('GameView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReport();
  });

  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('renders the GlobalAchievementsPreview component via mock', () => {
    render(<GameView />);

    expect(screen.getByText('Mock Achievements for 123')).toBeTruthy();
  });

  it('renders the game name once, in the banner bar under the artwork', () => {
    render(<GameView />);

    expect(screen.getAllByText('Test Game')).toHaveLength(1);
  });

  it('goes back from the floating back button', () => {
    render(<GameView />);

    fireEvent.press(screen.getByTestId('game-back'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows the live player count and streak under the title', () => {
    render(<GameView />);

    expect(screen.getByText('0 playing now')).toBeTruthy();
    // The streak request is still in flight on first render, so match either state.
    expect(screen.getByText(/streak/i)).toBeTruthy();
  });

  it('shows the last played date including the year', () => {
    render(<GameView />);

    const lastPlayed = formatShortDateWithYear(1620000000);

    expect(screen.getByText(lastPlayed)).toBeTruthy();
    expect(lastPlayed).toContain('2021');
  });

  it('takes the two-week hours from this game’s entry in the backend report', () => {
    render(<GameView />);

    expect(screen.getByText('2 weeks')).toBeTruthy();
    // 195 minutes for app 123, truncated to whole hours; app 999 must not leak in.
    expect(screen.getByText('3h')).toBeTruthy();
    expect(screen.queryByText('10h')).toBeNull();
  });

  it('shows no two-week hours for a game absent from the report', () => {
    mockReport({ playtimeReport: { date: '2026-08-18', game_reports: [] } });

    render(<GameView />);

    expect(screen.getByText('0h')).toBeTruthy();
  });

  it('holds the two-week tile at a dash while the report is in flight', () => {
    mockReport({ playtimeReport: null, isLoadingPlaytimeReport: true });

    render(<GameView />);

    expect(screen.getByText('—')).toBeTruthy();
  });

  it('opens the achievements list when the achievements progress summary is pressed in portrait', () => {
    render(<GameView />);

    fireEvent.press(screen.getByTestId('achievements-summary'));

    expect(mockNavigate).toHaveBeenCalledWith(
      'AchievementsList',
      expect.objectContaining({ gameID: '123' })
    );
  });

  describe('landscape mode', () => {
    beforeEach(() => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: true,
        width: 844,
        height: 390,
      });
    });

    it('renders the 2-column landscape layout with 4 tabs and full-width banner', () => {
      render(<GameView />);

      expect(screen.getByText('Test Game')).toBeTruthy();
      expect(screen.getByTestId('game-tab-achievements')).toBeTruthy();
      expect(screen.getByTestId('game-tab-news')).toBeTruthy();
      expect(screen.getByTestId('game-tab-guides')).toBeTruthy();
      expect(screen.getByTestId('game-tab-screenshots')).toBeTruthy();
    });

    it('goes back from floating back button in landscape', () => {
      render(<GameView />);

      fireEvent.press(screen.getByTestId('game-back'));
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('displays inline achievements detail when achievements summary is pressed in landscape without navigating away', () => {
      render(<GameView />);

      fireEvent.press(screen.getByTestId('achievements-summary'));

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('back-to-tabs')).toBeTruthy();
    });

    it('returns to tabs when Back to Tabs is pressed', () => {
      render(<GameView />);

      fireEvent.press(screen.getByTestId('achievements-summary'));
      expect(screen.getByTestId('back-to-tabs')).toBeTruthy();

      fireEvent.press(screen.getByTestId('back-to-tabs'));
      expect(screen.getByTestId('game-tab-achievements')).toBeTruthy();
    });

    it('opens inline achievements detail when See All is pressed on achievements preview in landscape', () => {
      render(<GameView />);

      fireEvent.press(screen.getByTestId('mock-global-achievements'));

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('back-to-tabs')).toBeTruthy();
    });

    it('switches to screenshots tab in landscape and renders screenshots grid', () => {
      render(<GameView />);

      fireEvent.press(screen.getByTestId('game-tab-screenshots'));
      expect(screen.getByText('Community in-game screenshots')).toBeTruthy();
    });

    it('renders wrapped stat labels and centered values in landscape', () => {
      render(<GameView />);

      expect(screen.getByText('Last played')).toBeTruthy();
      expect(screen.getByText('Total')).toBeTruthy();
      expect(screen.getByText('2 weeks')).toBeTruthy();
    });
  });
});
