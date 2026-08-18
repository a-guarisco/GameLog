import { render, screen } from '@testing-library/react-native';
import ProfileHoursPerGame from '@gamelog/profile/ProfileHoursPerGame';
import type { TopGame } from '@gamelog/profile/profileSelectors';

const GAMES: TopGame[] = [
  { appid: '236390', name: 'War Thunder', hoursLabel: '412h', percentOfTop: 100 },
  { appid: '730', name: 'Counter-Strike 2', hoursLabel: '268h', percentOfTop: 65 },
  { appid: '620', name: 'Portal 2', hoursLabel: '2h', percentOfTop: 0.5 },
];

describe('ProfileHoursPerGame', () => {
  it('labels the block', () => {
    render(<ProfileHoursPerGame games={GAMES} />);

    expect(screen.getByText('Hours per game')).toBeTruthy();
  });

  it('renders a column per game with its name and hours', () => {
    render(<ProfileHoursPerGame games={GAMES} />);

    GAMES.forEach((game) => {
      expect(screen.getByText(game.name)).toBeTruthy();
      expect(screen.getByText(game.hoursLabel)).toBeTruthy();
    });
  });

  it('sizes each column against the most played game', () => {
    render(<ProfileHoursPerGame games={GAMES} />);

    expect(screen.getByTestId('profile-hours-bar-236390').props.style).toEqual(
      expect.objectContaining({ height: '100%' })
    );
    expect(screen.getByTestId('profile-hours-bar-730').props.style).toEqual(
      expect.objectContaining({ height: '65%' })
    );
  });

  it('keeps a barely-played game visible instead of collapsing it onto the axis', () => {
    render(<ProfileHoursPerGame games={GAMES} />);

    expect(screen.getByTestId('profile-hours-bar-620').props.style).toEqual(
      expect.objectContaining({ height: '6%' })
    );
  });

  it('keeps long game names on one line', () => {
    render(<ProfileHoursPerGame games={GAMES} />);

    expect(screen.getByText('Counter-Strike 2').props.numberOfLines).toBe(1);
  });

  it('explains an empty library instead of showing a bare axis', () => {
    render(<ProfileHoursPerGame games={[]} />);

    expect(screen.getByText('No playtime recorded yet')).toBeTruthy();
    expect(screen.queryByTestId('profile-hours-bar-236390')).toBeNull();
  });

  it('says the library failed rather than claiming nothing was played', () => {
    render(<ProfileHoursPerGame games={[]} hasError />);

    expect(screen.getByText('Could not load playtime')).toBeTruthy();
    expect(screen.queryByText('No playtime recorded yet')).toBeNull();
  });
});
