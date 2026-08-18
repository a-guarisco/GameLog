import { fireEvent, render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';
import { formatShortDateWithYear } from '@gamelog/utils/formatUtils';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
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
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const GlobalAchievementsPreview = ({ gameID }: any) => (
    <Text>Mock Achievements for {gameID}</Text>
  );
  return GlobalAchievementsPreview;
});

describe('GameView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('renders the GlobalAchievementsPreview component via mock', () => {
    render(<GameView />);

    expect(screen.getByText('Mock Achievements for 123')).toBeTruthy();
  });

  it('renders the game name once, in the title block below the artwork', () => {
    render(<GameView />);

    expect(screen.getByText('Test Game')).toBeTruthy();
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

  it('opens the achievements list when the achievements progress summary is pressed', () => {
    render(<GameView />);

    fireEvent.press(screen.getByTestId('achievements-summary'));

    expect(mockNavigate).toHaveBeenCalledWith(
      'AchievementsList',
      expect.objectContaining({ gameID: '123' })
    );
  });
});
