import { render, screen } from '@testing-library/react-native';
import ProfileTopGames from '@gamelog/profile/ProfileTopGames';
import type { TopGame } from '@gamelog/profile/profileSelectors';

const GAMES: TopGame[] = [
  { appid: '236390', name: 'War Thunder', hoursLabel: '412h', percentOfTop: 100 },
  { appid: '730', name: 'Counter-Strike 2', hoursLabel: '268h', percentOfTop: 65 },
];

describe('ProfileTopGames', () => {
  it('labels the block', () => {
    render(<ProfileTopGames games={GAMES} />);

    expect(screen.getByText('Top games by hours')).toBeTruthy();
  });

  it('renders a row per game with its name and hours', () => {
    render(<ProfileTopGames games={GAMES} />);

    GAMES.forEach((game) => {
      expect(screen.getByText(game.name)).toBeTruthy();
      expect(screen.getByText(game.hoursLabel)).toBeTruthy();
    });
  });

  it('sizes each track against the most played game', () => {
    render(<ProfileTopGames games={GAMES} />);

    expect(screen.getByTestId('profile-top-game-fill-236390').props.style).toEqual(
      expect.objectContaining({ width: '100%' })
    );
    expect(screen.getByTestId('profile-top-game-fill-730').props.style).toEqual(
      expect.objectContaining({ width: '65%' })
    );
  });

  it('keeps long game names on one line', () => {
    render(<ProfileTopGames games={GAMES} />);

    expect(screen.getByText('Counter-Strike 2').props.numberOfLines).toBe(1);
  });

  it('explains an empty list instead of showing bare tracks', () => {
    render(<ProfileTopGames games={[]} />);

    expect(screen.getByText('No playtime recorded yet')).toBeTruthy();
    expect(screen.queryByTestId('profile-top-game-fill-236390')).toBeNull();
  });

  it('says the library failed rather than claiming nothing was played', () => {
    render(<ProfileTopGames games={[]} hasError />);

    expect(screen.getByText('Could not load playtime')).toBeTruthy();
    expect(screen.queryByText('No playtime recorded yet')).toBeNull();
  });
});
