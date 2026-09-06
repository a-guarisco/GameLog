import { render } from '@testing-library/react-native';
import { RefreshControl, useColorScheme } from 'react-native';
import { GLRefreshControl } from '@gamelog/common/GLRefreshControl';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(),
}));

describe('GLRefreshControl', () => {
  const primaryColor = toHex(brand.primary[500]);
  const lightProgressBg = toHex(brand.bgLight[50]);
  const darkProgressBg = toHex(brand.bgDark[50]);

  beforeEach(() => {
    jest.clearAllMocks();
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('renders with default primary blue spinner color in light mode', () => {
    const onRefresh = jest.fn();
    const { UNSAFE_getByType } = render(
      <GLRefreshControl refreshing={false} onRefresh={onRefresh} />
    );

    const refreshControl = UNSAFE_getByType(RefreshControl);
    expect(refreshControl.props.tintColor).toBe(primaryColor);
    expect(refreshControl.props.colors).toEqual([primaryColor]);
    expect(refreshControl.props.progressBackgroundColor).toBe(lightProgressBg);
    expect(refreshControl.props.refreshing).toBe(false);
  });

  it('renders with dark surface progressBackgroundColor in dark mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { UNSAFE_getByType } = render(<GLRefreshControl refreshing={true} />);

    const refreshControl = UNSAFE_getByType(RefreshControl);
    expect(refreshControl.props.tintColor).toBe(primaryColor);
    expect(refreshControl.props.colors).toEqual([primaryColor]);
    expect(refreshControl.props.progressBackgroundColor).toBe(darkProgressBg);
    expect(refreshControl.props.refreshing).toBe(true);
  });

  it('allows custom tintColor, colors, and progressBackgroundColor overrides', () => {
    const { UNSAFE_getByType } = render(
      <GLRefreshControl
        refreshing={false}
        tintColor="#ff0000"
        colors={['#00ff00']}
        progressBackgroundColor="#0000ff"
      />
    );

    const refreshControl = UNSAFE_getByType(RefreshControl);
    expect(refreshControl.props.tintColor).toBe('#ff0000');
    expect(refreshControl.props.colors).toEqual(['#00ff00']);
    expect(refreshControl.props.progressBackgroundColor).toBe('#0000ff');
  });
});
