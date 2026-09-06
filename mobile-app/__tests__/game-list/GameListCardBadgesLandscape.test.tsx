import { render } from '@testing-library/react-native';
import { GameListCardBadges } from '@gamelog/game-list/GameListCardBadges';
import { GameListItemData } from '@gamelog/game-list/useGameList';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const mockUseOrientation = jest.fn();
jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: () => mockUseOrientation(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

const baseGame: GameListItemData = {
  appid: 123,
  name: 'Hades',
  playtime_forever: 300, // 5h
  playtime_windows_forever: 100,
  playtime_mac_forever: 0,
  playtime_linux_forever: 0,
  playtime_deck_forever: 0,
  rtime_last_played: Math.floor(Date.now() / 1000) - 86400 * 2,
  playtime_disconnected: 0,
  playtime_2weeks: 0,
  streak: 7,
  maxPlaytimePerDay: 60, // 1h
  genres: ['Action', 'Rogue-like'],
  gameStatus: 'playing',
};

const topPlatform = { name: 'Windows', time: 100, iconName: 'logo-windows' };

describe('GameListCardBadges Orientation Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does NOT render game status chip in portrait when not expanded', () => {
    mockUseOrientation.mockReturnValue({
      isLandscape: false,
      width: 400,
      height: 800,
    });

    const { queryByText, getByText } = render(
      <GameListCardBadges
        gameItem={baseGame}
        topPlatform={topPlatform}
        lastPlayedText="2d"
        isExpanded={false}
        sortBy="playtime"
        platformFilter="All"
      />,
      { wrapper }
    );

    // Playtime and streak are visible
    expect(getByText('5h')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    // Game status ('Playing') is NOT visible in portrait unexpanded
    expect(queryByText('Playing')).toBeNull();
  });

  it('renders game status chip in landscape when unexpanded and space allows', () => {
    // Screen width 900 in landscape gives plenty of space (~230px card width)
    mockUseOrientation.mockReturnValue({
      isLandscape: true,
      width: 900,
      height: 400,
    });

    const { getByText } = render(
      <GameListCardBadges
        gameItem={baseGame}
        topPlatform={topPlatform}
        lastPlayedText="2d"
        isExpanded={false}
        sortBy="playtime"
        platformFilter="All"
      />,
      { wrapper }
    );

    // In landscape, 'Playing' should be included on the row
    expect(getByText('5h')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
    expect(getByText('Playing')).toBeTruthy();
  });

  it('does NOT add extra chips if they exceed the available row width in landscape', () => {
    // Narrow landscape width (e.g. 600px width), available width will be limited
    mockUseOrientation.mockReturnValue({
      isLandscape: true,
      width: 600,
      height: 350,
    });

    // Game with a very long status that won't fit alongside other chips
    const gameWithLongStatus: GameListItemData = {
      ...baseGame,
      gameStatus: 'to_be_played', // 'To Be Played' (12 chars ~ 112px)
      streak: 999,
      maxPlaytimePerDay: 120,
    };

    const { queryByText, getByText } = render(
      <GameListCardBadges
        gameItem={gameWithLongStatus}
        topPlatform={topPlatform}
        lastPlayedText="2d"
        isExpanded={false}
        sortBy="playtime"
        platformFilter="All"
      />,
      { wrapper }
    );

    // High priority chips fit
    expect(getByText('5h')).toBeTruthy();
    expect(getByText('999')).toBeTruthy();
    // In limited width (~160px), To Be Played (112px + 49px + 49px > 200px) does not fit on 1 row, so omitted
    expect(queryByText('To Be Played')).toBeNull();
  });
});
