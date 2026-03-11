import { render, screen } from '@testing-library/react-native';
import GameList from '../../src/game-list/GameList';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock(
  '../../src/common',
  () => jest.requireActual('../../src/helpers/testHelpers').commonGLMocks
);

describe('GameList', () => {
  it('renders without crashing', () => {
    render(<GameList />);
  });

  it('displays the game list text', () => {
    render(<GameList />);
    expect(screen.getByText('This is the game list!')).toBeTruthy();
  });
});
