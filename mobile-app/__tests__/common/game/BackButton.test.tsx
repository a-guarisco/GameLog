import { fireEvent, render, screen } from '@testing-library/react-native';
import BackButton from '@gamelog/common/game/BackButton';

describe('BackButton', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<BackButton onPress={onPress} />);

    fireEvent.press(screen.getByTestId('back-button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is announced as a button with a label', () => {
    render(<BackButton onPress={jest.fn()} />);

    const button = screen.getByTestId('back-button');

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Go back');
  });

  it('sits below the notch', () => {
    render(<BackButton onPress={jest.fn()} />);

    expect(screen.getByTestId('back-button').props.style).toEqual(
      expect.objectContaining({ top: expect.any(Number) })
    );
  });

  it('accepts a custom testID so a screen can have more than one', () => {
    render(<BackButton onPress={jest.fn()} testID="game-back" />);

    expect(screen.getByTestId('game-back')).toBeTruthy();
  });
});
