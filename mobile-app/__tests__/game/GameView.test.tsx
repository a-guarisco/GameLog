import { render, screen } from '@testing-library/react-native';
import GameView from '../../src/game/GameView';

jest.mock('../../src/common', () => jest.requireActual('../../src/utils/testUtils').commonGLMocks);

describe('Game', () => {
  it('renders without crashing', () => {
    render(<GameView />);
  });

  it('displays the game page text', () => {
    render(<GameView />);
    expect(screen.getByText('This is the game page!')).toBeTruthy();
  });
});
