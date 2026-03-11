import { render, screen } from '@testing-library/react-native';
import Game from '../../src/game/Game';

jest.mock('../../src/common', () => require('../../src/helpers/testHelpers').commonGLMocks);

describe('Game', () => {
  it('renders without crashing', () => {
    render(<Game />);
  });

  it('displays the game page text', () => {
    render(<Game />);
    expect(screen.getByText('This is the game page!')).toBeTruthy();
  });
});
