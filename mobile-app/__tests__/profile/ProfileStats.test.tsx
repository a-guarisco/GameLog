import { render, screen } from '@testing-library/react-native';
import ProfileStats from '@gamelog/profile/ProfileStats';
import type { OwnedGames } from '@gamelog/api-manager/dto';

const buildGame = (overrides: Record<string, unknown> = {}) =>
  ({
    appid: '236390',
    name: 'War Thunder',
    playtime_forever: 86280,
    img_icon_url: '',
    has_community_visible_stats: true,
    playtime_windows_forever: 86280,
    playtime_mac_forever: 0,
    playtime_linux_forever: 0,
    playtime_deck_forever: 0,
    rtime_last_played: 1785334609,
    ...overrides,
  }) as OwnedGames['response']['games'][0];

const OWNED_GAMES: OwnedGames = {
  response: {
    game_count: 160,
    games: [buildGame(), buildGame({ appid: '730', name: 'CS2' })],
  },
};

describe('ProfileStats', () => {
  it('renders the three band labels', () => {
    render(<ProfileStats ownedGames={OWNED_GAMES} />);

    ['Owned', '2 weeks', 'Total'].forEach((label) => expect(screen.getByText(label)).toBeTruthy());
  });

  it('shows the library size reported by Steam', () => {
    render(<ProfileStats ownedGames={OWNED_GAMES} />);

    expect(screen.getByText('160')).toBeTruthy();
  });

  it('shows the two-week hours reported by the backend', () => {
    render(<ProfileStats ownedGames={OWNED_GAMES} recentMinutes={240} />);

    expect(screen.getByText('4 h')).toBeTruthy();
  });

  it('sums lifetime playtime into grouped hours', () => {
    render(<ProfileStats ownedGames={OWNED_GAMES} />);

    expect(screen.getByText('2,876 h')).toBeTruthy();
  });

  it('renders zeroes rather than blanks when there is no library', () => {
    render(<ProfileStats ownedGames={null} />);

    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getAllByText('0 h')).toHaveLength(2);
  });
});
