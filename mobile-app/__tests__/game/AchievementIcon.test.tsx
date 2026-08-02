import * as ReactNative from 'react-native';
import { render } from '@testing-library/react-native';
import { Path, Svg } from 'react-native-svg';
import AchievementIcon from '@gamelog/game/AchievementIcon';

const useColorSchemeMock = jest.spyOn(ReactNative, 'useColorScheme');

describe('AchievementIcon', () => {
  afterAll(() => {
    useColorSchemeMock.mockRestore();
  });

  it('renders the locked icon when isUnlocked is false', () => {
    useColorSchemeMock.mockReturnValue('light');

    const { UNSAFE_getByType } = render(<AchievementIcon isUnlocked={false} />);

    const svg = UNSAFE_getByType(Svg);
    expect(svg.props.viewBox).toBe('-13.39 0 122.88 122.88');
    expect(UNSAFE_getByType(Path).props.fill).toBe('#3b3b3b');
  });

  it('renders the unlocked icon when isUnlocked is true', () => {
    useColorSchemeMock.mockReturnValue('light');

    const { UNSAFE_getByType } = render(<AchievementIcon isUnlocked={true} />);

    const svg = UNSAFE_getByType(Svg);
    expect(svg.props.viewBox).toBe('0 0 512 512');
    expect(UNSAFE_getByType(Path).props.fill).toBe('#3b3b3b');
  });

  it('uses the dark theme icon color when color scheme is dark', () => {
    useColorSchemeMock.mockReturnValue('dark');

    const { UNSAFE_getByType } = render(<AchievementIcon isUnlocked={true} />);

    expect(UNSAFE_getByType(Path).props.fill).toBe('#717070');
  });
});
