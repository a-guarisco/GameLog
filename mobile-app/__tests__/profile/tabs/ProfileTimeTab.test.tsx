import { render, fireEvent } from '@testing-library/react-native';
import ProfileTimeTab from '@gamelog/profile/tabs/ProfileTimeTab';
import { useOrientation } from '@gamelog/common/useOrientation';

jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: jest.fn(),
}));

jest.mock('@gamelog/common/charts/playtime-blocks/PlaytimeBlocksChart', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () => <View testID="mock-playtime-blocks" />,
  };
});

jest.mock('@gamelog/common/charts/total-hours/TotalHoursChart', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ targetHeight }: any) => (
      <View testID="mock-total-hours-chart">
        <Text testID="target-height">{String(targetHeight)}</Text>
      </View>
    ),
  };
});

jest.mock('@gamelog/common/charts/total-hours/TotalHoursDoughnut', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () => <View testID="mock-total-hours-doughnut" />,
  };
});

describe('ProfileTimeTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders stacked layout on phone portrait mode', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      isTablet: false,
    });

    const { getByTestId, queryByTestId } = render(
      <ProfileTimeTab ownedGames={null} playtimeByUser={null} />
    );

    expect(getByTestId('mock-playtime-blocks')).toBeTruthy();
    expect(getByTestId('mock-total-hours-chart')).toBeTruthy();
    expect(getByTestId('mock-total-hours-doughnut')).toBeTruthy();

    expect(getByTestId('target-height').props.children).toBe('undefined');

    // In stacked mode, the 60% split container does not exist
    expect(queryByTestId('total-hours-split-doughnut-box')).toBeNull();
  });

  it('renders 40-60 split in tablet portrait mode and syncs doughnut height to bar chart', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      isTablet: true,
    });

    const { getByTestId } = render(<ProfileTimeTab ownedGames={null} playtimeByUser={null} />);

    expect(getByTestId('mock-playtime-blocks')).toBeTruthy();
    expect(getByTestId('mock-total-hours-chart')).toBeTruthy();
    expect(getByTestId('mock-total-hours-doughnut')).toBeTruthy();

    // In two-column split, the 60% split container exists
    const doughnutBox = getByTestId('total-hours-split-doughnut-box');
    expect(doughnutBox).toBeTruthy();

    // Initially undefined before layout
    expect(getByTestId('target-height').props.children).toBe('undefined');

    // Fire layout on the 60% container
    fireEvent(doughnutBox, 'layout', {
      nativeEvent: { layout: { height: 350 } },
    });

    // In tablet portrait, height is matched to doughnut height
    expect(getByTestId('target-height').props.children).toBe('350');
  });

  it('renders 40-60 split in landscape mode and syncs doughnut height to bar chart', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      isTablet: false,
    });

    const { getByTestId } = render(<ProfileTimeTab ownedGames={null} playtimeByUser={null} />);

    // In two-column split, the 60% split container exists
    const doughnutBox = getByTestId('total-hours-split-doughnut-box');
    expect(doughnutBox).toBeTruthy();

    // Initially undefined before layout
    expect(getByTestId('target-height').props.children).toBe('undefined');

    // Fire layout on the 60% container
    fireEvent(doughnutBox, 'layout', {
      nativeEvent: { layout: { height: 350 } },
    });

    // In landscape, targetHeight should update to match measured height
    expect(getByTestId('target-height').props.children).toBe('350');
  });
});
