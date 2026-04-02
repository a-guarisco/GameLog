import { render, fireEvent } from '@testing-library/react-native';
import { GameOverviewStatsCard } from '@gamelog/game-list/GameOverviewStatsCard';
import { OwnedGames } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/common/GameHeaderCard', () => {
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    GameHeaderCard: ({ children, name, onPress }: any) => (
      <Pressable onPress={onPress} testID="game-header-card">
        <Text>{name}</Text>
        {children}
      </Pressable>
    ),
  };
});

const mockGameItem: OwnedGames['response']['games'][0] = {
  appid: '12345',
  name: 'Test Game',
  img_icon_url: '',
  has_community_visible_stats: true,
  playtime_forever: 120,
  playtime_windows_forever: 60,
  playtime_mac_forever: 0,
  playtime_linux_forever: 0,
  playtime_deck_forever: 60,
  rtime_last_played: 1672531200, // 2023-01-01
};

describe('GameOverviewStatsCard', () => {
  it('renders correctly the game name and total playtime', () => {
    const { getByText } = render(
      <GameOverviewStatsCard gameItem={mockGameItem as OwnedGames['response']['games'][0]} />
    );

    expect(getByText('Test Game')).toBeTruthy();
    expect(getByText('2h 0m')).toBeTruthy();
  });

  it('shows correctly the playtime for each platform', () => {
    const { getByText } = render(
      <GameOverviewStatsCard gameItem={mockGameItem as OwnedGames['response']['games'][0]} />
    );

    expect(getByText('Windows: 1h')).toBeTruthy();
    expect(getByText('Deck: 1h')).toBeTruthy();
    expect(getByText('MacOS: 0h')).toBeTruthy();
  });

  it('shows correctly the game ID', () => {
    const { getByText } = render(
      <GameOverviewStatsCard gameItem={mockGameItem as OwnedGames['response']['games'][0]} />
    );

    expect(getByText('ID: 12345')).toBeTruthy();
  });

  it('calls the onPress function when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <GameOverviewStatsCard
        gameItem={mockGameItem as OwnedGames['response']['games'][0]}
        onPress={mockOnPress}
      />
    );

    const card = getByTestId('game-header-card');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('formats the last played date correctly', () => {
    const { getByText } = render(
      <GameOverviewStatsCard gameItem={mockGameItem as OwnedGames['response']['games'][0]} />
    );

    // The result depends on the system locale, but we verify that the text exists
    // 1672531200 -> 1/1/2023 (or locale formatted equivalent)
    const expectedDate = new Date(mockGameItem.rtime_last_played * 1000).toLocaleDateString();
    expect(getByText(expectedDate)).toBeTruthy();
  });
});
