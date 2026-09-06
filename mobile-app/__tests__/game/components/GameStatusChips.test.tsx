import { render, screen } from '@testing-library/react-native';
import GameStatusChips from '@gamelog/game/GameStatusChips';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameStatus: jest.fn(() => ({
    gameStatus: 'playing',
    isLoadingGameStatus: false,
    refetchGameStatus: jest.fn(),
  })),
  useUpdateGameStatus: jest.fn(() => ({
    updateGameStatus: jest.fn(),
    isUpdatingGameStatus: false,
    updateGameStatusError: null,
  })),
}));

const defaultProps = {
  livePlayers: 412249,
};

describe('GameStatusChips', () => {
  it('renders the live player count with thousand separators', () => {
    render(<GameStatusChips {...defaultProps} />);

    expect(screen.getByText('412,249 playing now')).toBeTruthy();
  });

  it('renders GameStatusSelectorChip when appId is provided', () => {
    render(<GameStatusChips {...defaultProps} appId="730" status="playing" />);

    expect(screen.getByText(/Playing/)).toBeTruthy();
  });
});
