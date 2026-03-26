import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GameView from '@gamelog/game/GameView';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

jest.mock('@gamelog/components/game-view/GlobalAchievementsPreview', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const GlobalAchievementsPreview = ({ gameID }: any) => (
    <Text>Mock Achievements for {gameID}</Text>
  );
  return GlobalAchievementsPreview;
});

const mockGameItem = {
  appid: 236390,
  name: 'Portal 2',
};

describe('GameView', () => {
  const mockRoute = {
    params: { gameItem: mockGameItem },
  };

  it('renders without crashing', () => {
    render(<GameView route={mockRoute as any} />);
  });

  it('displays the correct game page text and game ID', () => {
    render(<GameView route={mockRoute as any} />);

    expect(screen.getByText(/This is the game page!/i)).toBeTruthy();
    expect(screen.getByText(/Here is the game ID! 236390/i)).toBeTruthy();
  });

  it('renders the GlobalAchievementsPreview component via mock', () => {
    render(<GameView route={mockRoute as any} />);

    expect(screen.getByText('Mock Achievements for 236390')).toBeTruthy();
  });
});
