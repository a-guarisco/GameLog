import * as ReactNative from 'react-native';
import { render, screen } from '@testing-library/react-native';
import AchievementIcon from '@gamelog/game/AchievementIcon';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

const useColorSchemeMock = jest.spyOn(ReactNative, 'useColorScheme');

describe('AchievementIcon', () => {
  afterAll(() => {
    useColorSchemeMock.mockRestore();
  });

  it('renders the locked icon when isUnlocked is false', () => {
    useColorSchemeMock.mockReturnValue('light');

    render(<AchievementIcon isUnlocked={false} />);

    const icon = screen.getByTestId('achievement-icon-locked');
    expect(icon).toBeTruthy();
    const flattenedStyle = ReactNative.StyleSheet.flatten(icon.props.style);
    expect(flattenedStyle.color).toBe(toHex(brand.typographyLight['400']));
  });

  it('renders the unlocked icon when isUnlocked is true', () => {
    useColorSchemeMock.mockReturnValue('light');

    render(<AchievementIcon isUnlocked={true} />);

    const icon = screen.getByTestId('achievement-icon-unlocked');
    expect(icon).toBeTruthy();
    const flattenedStyle = ReactNative.StyleSheet.flatten(icon.props.style);
    expect(flattenedStyle.color).toBe(toHex(brand.primary['500']));
  });

  it('uses the dark theme icon color when color scheme is dark', () => {
    useColorSchemeMock.mockReturnValue('dark');

    render(<AchievementIcon isUnlocked={true} />);

    const icon = screen.getByTestId('achievement-icon-unlocked');
    const flattenedStyle = ReactNative.StyleSheet.flatten(icon.props.style);
    expect(flattenedStyle.color).toBe(toHex(brand.primary['400']));
  });
});
