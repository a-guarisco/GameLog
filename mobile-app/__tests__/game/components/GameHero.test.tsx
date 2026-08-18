import { fireEvent, render, screen } from '@testing-library/react-native';
import GameHero from '@gamelog/game/GameHero';

const defaultProps = {
  appid: '123456',
  name: 'War Thunder',
  onBack: jest.fn(),
};

describe('GameHero', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Steam header artwork for the app id', () => {
    render(<GameHero {...defaultProps} />);

    const artwork = screen.getByLabelText('War Thunder artwork');

    expect(artwork.props.source).toEqual({
      uri: 'https://cdn.akamai.steamstatic.com/steam/apps/123456/header.jpg',
    });
  });

  it('calls onBack when the back button is pressed', () => {
    render(<GameHero {...defaultProps} />);

    fireEvent.press(screen.getByTestId('game-hero-back'));

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('no longer renders the title or chips over the artwork', () => {
    render(<GameHero {...defaultProps} />);

    expect(screen.queryByText('War Thunder')).toBeNull();
    expect(screen.queryByText(/playing now/)).toBeNull();
    expect(screen.queryByText(/streak/)).toBeNull();
  });
});
