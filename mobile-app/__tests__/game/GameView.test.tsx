import { render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Game', () => {
  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('displays the game page text', () => {
    render(<GameView />);
    expect(screen.getByText('This is the game page!')).toBeTruthy();
  });

  it('renders the GlobalAchievementsPreview component', () => {
    render(<GameView />);
    expect(screen.getByText('Global Achievements')).toBeTruthy();
  });
});
