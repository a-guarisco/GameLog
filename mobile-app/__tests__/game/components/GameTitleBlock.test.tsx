import { render, screen } from '@testing-library/react-native';
import GameTitleBlock from '@gamelog/game/GameTitleBlock';

const defaultProps = {
  name: 'War Thunder',
  livePlayers: 412249,
  streakText: '0 day streak',
};

describe('GameTitleBlock', () => {
  it('renders the game name', () => {
    render(<GameTitleBlock {...defaultProps} />);

    expect(screen.getByText('War Thunder')).toBeTruthy();
  });

  it('renders the live player count with thousand separators', () => {
    render(<GameTitleBlock {...defaultProps} />);

    expect(screen.getByText('412,249 playing now')).toBeTruthy();
  });

  it('renders the streak text as given', () => {
    render(<GameTitleBlock {...defaultProps} streakText="🔥 5 day streak" />);

    expect(screen.getByText('🔥 5 day streak')).toBeTruthy();
  });

  it('centres the title and the chips underneath it', () => {
    render(<GameTitleBlock {...defaultProps} />);

    expect(screen.getByText('War Thunder').props.className).toContain('text-center');
  });

  it('keeps the name on at most two lines', () => {
    render(<GameTitleBlock {...defaultProps} />);

    expect(screen.getByText('War Thunder').props.numberOfLines).toBe(2);
  });

  it('uses theme tokens rather than fixed white text so dark mode still reads', () => {
    render(<GameTitleBlock {...defaultProps} />);

    expect(screen.getByText('War Thunder').props.className).toContain('text-typography-0');
    expect(screen.getByText('0 day streak').props.className).toContain('text-typography-100');
  });
});
