import { render, screen, fireEvent } from '@testing-library/react-native';
import SeeAllLink from '@gamelog/common/SeeAllLink';

describe('SeeAllLink', () => {
  it('renders the label and reports presses', () => {
    const onPress = jest.fn();
    render(<SeeAllLink label="See all news" onPress={onPress} testID="see-all-news" />);

    expect(screen.getByText('See all news')).toBeTruthy();

    fireEvent.press(screen.getByTestId('see-all-news'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reads as a link by default and as a button for in-app navigation', () => {
    const { rerender } = render(
      <SeeAllLink label="See all news" onPress={jest.fn()} testID="see-all" />
    );
    expect(screen.getByTestId('see-all').props.accessibilityRole).toBe('link');

    rerender(
      <SeeAllLink
        label="See all 12 achievements"
        onPress={jest.fn()}
        accessibilityRole="button"
        testID="see-all"
      />
    );
    expect(screen.getByTestId('see-all').props.accessibilityRole).toBe('button');
    expect(screen.getByTestId('see-all').props.accessibilityLabel).toBe('See all 12 achievements');
  });

  it('renders correctly in dark mode', () => {
    const ReactNative = require('react-native');
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValueOnce('dark');
    render(<SeeAllLink label="See all" onPress={jest.fn()} />);
    expect(screen.getByText('See all')).toBeTruthy();
  });
});
