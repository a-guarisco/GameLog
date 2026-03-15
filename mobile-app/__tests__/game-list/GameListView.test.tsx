import { render, screen } from '@testing-library/react-native';
import GameListView from '../../src/game-list/GameListView';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../src/common', () => jest.requireActual('../../src/utils/testUtils').commonGLMocks);

describe('GameList', () => {
  it('renders without crashing', () => {
    render(<GameListView />);
  });

  it('displays the game list text', () => {
    render(<GameListView />);
    expect(screen.getByText('This is the game list!')).toBeTruthy();
  });
});
