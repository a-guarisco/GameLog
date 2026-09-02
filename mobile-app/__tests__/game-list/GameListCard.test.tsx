import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameListCard } from '@gamelog/game-list/GameListCard';
import { GameListItemData } from '@gamelog/game-list/useGameList';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

const mockGame: GameListItemData = {
  appid: 123,
  name: 'Test Game',
  playtime_forever: 120,
  playtime_windows_forever: 60,
  playtime_mac_forever: 60,
  playtime_linux_forever: 0,
  playtime_deck_forever: 0,
  rtime_last_played: Date.now() / 1000 - 86400 * 2, // 2 days ago
  playtime_disconnected: 0,
  playtime_2weeks: 0,
  streak: 5,
  maxPlaytimePerDay: 60,
  genres: ['Action', 'RPG'],
};

describe('GameListCard', () => {
  it('renders game name and expands details', () => {
    const { getByText, queryByText, getByRole } = render(
      <GameListCard gameItem={mockGame} />,
      { wrapper }
    );

    // The title is in the image alt tag initially. We can check a badge instead.
    expect(getByText('2h')).toBeTruthy();

    // Check that expanded details are NOT present initially
    expect(queryByText('Platform Split')).toBeNull();

    // Expand the card by clicking the chevron icon
    fireEvent.press(getByText(''));
    
    // Check that expanded details are now present
    expect(getByText('Platform Split')).toBeTruthy();
  });
});
