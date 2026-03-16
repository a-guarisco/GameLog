import { render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';

jest.mock('@gamelog/common', () => jest.requireActual('@gamelog/utils/testUtils').commonGLMocks);

describe('Game', () => {
  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('displays the game page text', () => {
    render(<GameView />);
    expect(screen.getByText('This is the game page!')).toBeTruthy();
  });
});
