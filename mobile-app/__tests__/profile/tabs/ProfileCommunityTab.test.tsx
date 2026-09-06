import { render, screen, fireEvent } from '@testing-library/react-native';
import ProfileCommunityTab from '@gamelog/profile/tabs/ProfileCommunityTab';

jest.mock(
  '@gamelog/common/charts/community-playtime-histogram/CommunityPlaytimeHistogramChart',
  () => {
    const { View, Text } = jest.requireActual('react-native');
    return {
      __esModule: true,
      default: ({ scope }: { scope: string }) => (
        <View testID="mock-community-playtime-histogram">
          <Text testID="histogram-scope">{scope}</Text>
        </View>
      ),
    };
  }
);

jest.mock(
  '@gamelog/common/charts/community-top-games-histogram/CommunityTopGamesHistogramChart',
  () => {
    const { View, Text } = jest.requireActual('react-native');
    return {
      __esModule: true,
      default: ({ scope }: { scope: string }) => (
        <View testID="mock-community-top-games-histogram">
          <Text testID="top-games-scope">{scope}</Text>
        </View>
      ),
    };
  }
);

describe('ProfileCommunityTab', () => {
  it('renders correctly with scope navigation tabs', () => {
    render(<ProfileCommunityTab />);

    expect(screen.getByTestId('profile-community-tab')).toBeTruthy();
    expect(screen.getByText('Global')).toBeTruthy();
    expect(screen.getByText('Region')).toBeTruthy();
    expect(screen.getByText('Friends')).toBeTruthy();
    expect(screen.getByTestId('mock-community-playtime-histogram')).toBeTruthy();
    expect(screen.getByTestId('mock-community-top-games-histogram')).toBeTruthy();
    expect(screen.getByTestId('histogram-scope').props.children).toBe('global');
    expect(screen.getByTestId('top-games-scope').props.children).toBe('global');
  });

  it('switches scopes when pressing tabs', () => {
    render(<ProfileCommunityTab />);

    fireEvent.press(screen.getByText('Region'));
    expect(screen.getByTestId('histogram-scope').props.children).toBe('region');
    expect(screen.getByTestId('top-games-scope').props.children).toBe('region');

    fireEvent.press(screen.getByText('Friends'));
    expect(screen.getByTestId('histogram-scope').props.children).toBe('friends');
    expect(screen.getByTestId('top-games-scope').props.children).toBe('friends');
  });
});
