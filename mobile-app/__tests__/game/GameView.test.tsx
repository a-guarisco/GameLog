import { render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
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

jest.mock('@gamelog/components/game-view/GlobalAchievementsPreview', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const GlobalAchievementsPreview = ({ gameID }: any) => (
    <Text>Mock Achievements for {gameID}</Text>
  );
  return GlobalAchievementsPreview;
});

describe('GameView', () => {
  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('renders the GlobalAchievementsPreview component via mock', () => {
    render(<GameView />);

    expect(screen.getByText('Mock Achievements for 123')).toBeTruthy();
  });
});
