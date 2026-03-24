import { render } from '@testing-library/react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { RootTabs, GameListStack } from '@gamelog/routes';

jest.mock('react-native-safe-area-context', () =>
  jest.requireActual('react-native-safe-area-context/jest/mock')
);
jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);

const Navigation = createStaticNavigation(RootTabs);
const renderApp = () => render(<Navigation />);

describe('GameListStack structure', () => {
  it('registers the correct screens', () => {
    const screens = Object.keys(GameListStack.config.screens);
    expect(screens).toContain('HomePage');
    expect(screens).toContain('Game');
  });

  it('registers exactly 3 screens', () => {
    expect(Object.keys(GameListStack.config.screens)).toHaveLength(3);
  });

  it('assigns the correct component to HomePage', () => {
    const GameList = jest.requireActual('@gamelog/game-list/GameListView').default;
    expect(GameListStack.config.screens.HomePage.screen).toBe(GameList);
  });

  it('assigns the correct component to Game', () => {
    const Game = jest.requireActual('@gamelog/game/GameView').default;
    expect(GameListStack.config.screens.Game.screen).toBe(Game);
  });
});

describe('RootTabs structure', () => {
  it('registers the correct tabs', () => {
    const screens = Object.keys(RootTabs.config.screens);
    expect(screens).toContain('GameList');
    expect(screens).toContain('Profile');
  });

  it('registers exactly 3 tabs', () => {
    expect(Object.keys(RootTabs.config.screens)).toHaveLength(3);
  });

  it('assigns GameListStack to the GameList tab', () => {
    expect(RootTabs.config.screens.GameList.screen).toBe(GameListStack);
  });

  it('assigns the correct component to the Profile tab', () => {
    const Profile = jest.requireActual('@gamelog/profile/ProfileView').default;
    expect(RootTabs.config.screens.Profile.screen).toBe(Profile);
  });
});
