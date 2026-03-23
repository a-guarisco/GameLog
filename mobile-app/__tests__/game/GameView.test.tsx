import { render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';

describe('Game', () => {
  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('displays the game page text', () => {
    render(<GameView />);
    expect(screen.getByText('This is the game page!')).toBeTruthy();
  });
});
