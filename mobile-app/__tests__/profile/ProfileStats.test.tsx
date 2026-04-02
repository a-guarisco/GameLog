import { render, screen } from '@testing-library/react-native';
import ProfileStats from '@gamelog/profile/ProfileStats';

jest.mock('@gamelog/components/ui/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@gamelog/common/StatTile', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    StatTile: ({ value, label }: { value: string; label: string }) => (
      <View testID="stat-tile">
        <Text testID="stat-value">{value}</Text>
        <Text testID="stat-label">{label}</Text>
      </View>
    ),
  };
});

describe('ProfileStats', () => {
  it('renders exactly three stat tiles', () => {
    render(<ProfileStats />);
    expect(screen.getAllByTestId('stat-tile')).toHaveLength(3);
  });

  it('renders the "Games Owned" tile with value 160', () => {
    render(<ProfileStats />);
    expect(screen.getByText('Games Owned')).toBeTruthy();
    expect(screen.getByText('160')).toBeTruthy();
  });

  it('renders the "Played in Last 2 Weeks" tile with value 18', () => {
    render(<ProfileStats />);
    expect(screen.getByText('Played in Last 2 Weeks')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
  });

  it('renders the "Games Completed" tile with value 10', () => {
    render(<ProfileStats />);
    expect(screen.getByText('Games Completed')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('renders all three labels', () => {
    render(<ProfileStats />);
    const labels = screen.getAllByTestId('stat-label').map((el) => el.props.children);
    expect(labels).toEqual(
      expect.arrayContaining(['Games Owned', 'Played in Last 2 Weeks', 'Games Completed'])
    );
  });
});
