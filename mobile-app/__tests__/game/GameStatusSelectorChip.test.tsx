import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import GameStatusSelectorChip from '@gamelog/game/GameStatusSelectorChip';
import { useGetGameStatus, useUpdateGameStatus } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameStatus: jest.fn(),
  useUpdateGameStatus: jest.fn(),
}));

const mockUseGetGameStatus = useGetGameStatus as jest.Mock;
const mockUseUpdateGameStatus = useUpdateGameStatus as jest.Mock;

describe('GameStatusSelectorChip', () => {
  const mockRefetch = jest.fn();
  const mockUpdateGameStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetGameStatus.mockReturnValue({
      gameStatus: 'playing',
      isLoadingGameStatus: false,
      refetchGameStatus: mockRefetch,
    });
    mockUseUpdateGameStatus.mockReturnValue({
      updateGameStatus: mockUpdateGameStatus,
      isUpdatingGameStatus: false,
      updateGameStatusError: null,
    });
  });

  it('renders with initialStatus prop if provided', () => {
    render(<GameStatusSelectorChip appId="730" initialStatus="to_be_played" />);

    expect(screen.getByText('To Be Played')).toBeTruthy();
  });

  it('falls back to fetched status when initialStatus is undefined', () => {
    render(<GameStatusSelectorChip appId="730" />);

    expect(screen.getByText('Playing')).toBeTruthy();
  });

  it('renders ellipsis when loading without a status', () => {
    mockUseGetGameStatus.mockReturnValue({
      gameStatus: null,
      isLoadingGameStatus: true,
      refetchGameStatus: mockRefetch,
    });

    render(<GameStatusSelectorChip appId="730" />);

    expect(screen.getByText('...')).toBeTruthy();
  });

  it('renders "No Status" when there is no status and not loading', () => {
    mockUseGetGameStatus.mockReturnValue({
      gameStatus: null,
      isLoadingGameStatus: false,
      refetchGameStatus: mockRefetch,
    });

    render(<GameStatusSelectorChip appId="730" />);

    expect(screen.getByText('No Status')).toBeTruthy();
  });

  it('opens modal on chip press and displays all status options', () => {
    render(<GameStatusSelectorChip appId="730" initialStatus="playing" />);

    fireEvent.press(screen.getByText('Playing'));

    expect(screen.getByText('Change Game Status')).toBeTruthy();
    expect(screen.getByText('To Be Played')).toBeTruthy();
    expect(screen.getByText('Shelved')).toBeTruthy();
    expect(screen.getByText('Platinato')).toBeTruthy();
  });

  it('selects the same status closes modal without updating', () => {
    render(<GameStatusSelectorChip appId="730" initialStatus="playing" />);

    fireEvent.press(screen.getByText('Playing'));
    // Press the "Playing" option inside the modal
    const playingOptions = screen.getAllByText('Playing');
    fireEvent.press(playingOptions[playingOptions.length - 1]);

    expect(mockUpdateGameStatus).not.toHaveBeenCalled();
  });

  it('updates game status successfully when a new option is chosen', async () => {
    const onStatusChange = jest.fn();
    mockUpdateGameStatus.mockResolvedValueOnce({ message: 'Success' });

    render(
      <GameStatusSelectorChip
        appId="730"
        initialStatus="playing"
        onStatusChange={onStatusChange}
      />
    );

    fireEvent.press(screen.getByText('Playing'));
    fireEvent.press(screen.getByText('Platinato'));

    await waitFor(() => {
      expect(mockUpdateGameStatus).toHaveBeenCalledWith('730', 'platinato');
      expect(onStatusChange).toHaveBeenCalledWith('platinato');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('displays error message if update fails', async () => {
    mockUpdateGameStatus.mockRejectedValueOnce(new Error('Network error'));

    render(<GameStatusSelectorChip appId="730" initialStatus="playing" />);

    fireEvent.press(screen.getByText('Playing'));
    fireEvent.press(screen.getByText('Shelved'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeTruthy();
    });
  });

  it('displays fallback error message if update fails with error without message', async () => {
    mockUpdateGameStatus.mockRejectedValueOnce({});

    render(<GameStatusSelectorChip appId="730" initialStatus="playing" />);

    fireEvent.press(screen.getByText('Playing'));
    fireEvent.press(screen.getByText('Shelved'));

    await waitFor(() => {
      expect(screen.getByText('Failed to update status. Please try again.')).toBeTruthy();
    });
  });
});
