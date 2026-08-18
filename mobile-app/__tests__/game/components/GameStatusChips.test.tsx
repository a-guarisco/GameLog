import { render, screen } from '@testing-library/react-native';
import GameStatusChips from '@gamelog/game/GameStatusChips';

const defaultProps = {
  livePlayers: 412249,
  streakText: '0 day streak',
};

describe('GameStatusChips', () => {
  it('renders the live player count with thousand separators', () => {
    render(<GameStatusChips {...defaultProps} />);

    expect(screen.getByText('412,249 playing now')).toBeTruthy();
  });

  it('renders the streak text as given', () => {
    render(<GameStatusChips {...defaultProps} streakText="🔥 5 day streak" />);

    expect(screen.getByText('🔥 5 day streak')).toBeTruthy();
  });

  it('leaves the game name to the banner above it', () => {
    render(<GameStatusChips {...defaultProps} />);

    expect(screen.queryByText('War Thunder')).toBeNull();
  });

  it('uses theme tokens rather than fixed white text so dark mode still reads', () => {
    render(<GameStatusChips {...defaultProps} />);

    expect(screen.getByText('0 day streak').props.className).toContain('text-typography-100');
  });
});
