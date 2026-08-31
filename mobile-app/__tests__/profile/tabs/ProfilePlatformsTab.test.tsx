import { render } from '@testing-library/react-native';
import ProfilePlatformsTab from '@gamelog/profile/tabs/ProfilePlatformsTab';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

jest.mock('@gamelog/common/charts/platform-split/PlatformSplitChart', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ split, hasError }: any) => (
      <View testID="mock-platform-split-chart">
        <Text testID="has-error">{String(hasError)}</Text>
        <Text testID="split-windows">{split?.windows ?? 0}</Text>
        <Text testID="split-mac">{split?.mac ?? 0}</Text>
        <Text testID="split-linux">{split?.linux ?? 0}</Text>
      </View>
    ),
  };
});

describe('ProfilePlatformsTab', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders PlatformSplitChart with given platformSplit and hasError=false', () => {
    const split = { windows: 80, mac: 15, linux: 5 };
    const { getByTestId } = renderWithProvider(
      <ProfilePlatformsTab platformSplit={split} hasError={false} />
    );

    expect(getByTestId('mock-platform-split-chart')).toBeTruthy();
    expect(getByTestId('has-error').props.children).toBe('false');
    expect(getByTestId('split-windows').props.children).toBe(80);
    expect(getByTestId('split-mac').props.children).toBe(15);
    expect(getByTestId('split-linux').props.children).toBe(5);
  });

  it('renders correctly when hasError=true', () => {
    const split = { windows: 0, mac: 0, linux: 0 };
    const { getByTestId } = renderWithProvider(
      <ProfilePlatformsTab platformSplit={split} hasError={true} />
    );

    expect(getByTestId('mock-platform-split-chart')).toBeTruthy();
    expect(getByTestId('has-error').props.children).toBe('true');
  });
});
