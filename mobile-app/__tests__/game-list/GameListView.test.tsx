import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import GameListView from '@gamelog/game-list/GameListView';

import { useGetOwnedGames } from '@gamelog/api-manager/useApi';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: jest.fn(),
}));

describe('GameListView', () => {
  const mockGames = {
    response: {
      games: [
        { appid: 1, name: 'Counter-Strike', playtime_forever: 1000 },
        { appid: 2, name: 'Portal', playtime_forever: 500 },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the loading spinner during loading', () => {
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      isLoadingOwnedGames: true,
    });

    render(<GameListView />);
    expect(screen.getByText(/Loading.../i)).toBeTruthy();
  });

  it('displays the list of games after loading', async () => {
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    render(<GameListView />);

    await waitFor(() => {
      expect(screen.getByText('Counter-Strike')).toBeTruthy();
      expect(screen.getByText('Portal')).toBeTruthy();
    });
  });

  it('changes the sorting criterion when the button is pressed', async () => {
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    render(<GameListView />);

    const sortButton = screen.getByText(/Sort by: playtime/i);

    fireEvent.press(sortButton);

    expect(screen.getByText(/Loading.../i)).toBeTruthy();

    await waitFor(
      () => {
        expect(screen.getByText(/Sort by: name/i)).toBeTruthy();
      },
      { timeout: 1000 }
    );
  });

  it('shows an error message if the API call fails', () => {
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      errorOwnedGames: true,
      isLoadingOwnedGames: false,
    });

    render(<GameListView />);
    expect(screen.getByText(/Failed to load games/i)).toBeTruthy();
  });

  it('shows a message when the list is null or empty', () => {
    // Testiamo il caso null (copre !ownedGames)
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
    });

    const { rerender } = render(<GameListView />);
    expect(screen.getByText(/No games found in your library/i)).toBeTruthy();

    // Testiamo il caso array vuoto (copre games.length === 0) nello stesso test usando rerender
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      ownedGames: { response: { games: [] } },
      isLoadingOwnedGames: false,
    });

    rerender(<GameListView />);
    expect(screen.getByText(/No games found in your library/i)).toBeTruthy();
  });

  it('navigates to Game details with correct params when a card is pressed', async () => {
    (useGetOwnedGames as jest.Mock).mockReturnValue({
      ownedGames: mockGames,
      isLoadingOwnedGames: false,
    });

    render(<GameListView />);

    const gameCard = await screen.findByText('Counter-Strike');

    fireEvent.press(gameCard);

    expect(mockNavigate).toHaveBeenCalledWith('Game', {
      gameItem: expect.objectContaining({
        name: 'Counter-Strike',
        appid: 1,
      }),
    });
  });
});
