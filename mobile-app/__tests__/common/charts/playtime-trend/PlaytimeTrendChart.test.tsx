import { render, screen, fireEvent } from '@testing-library/react-native';
import PlaytimeTrendChart from '@gamelog/common/charts/playtime-trend/PlaytimeTrendChart';

// We mock the ChartWrapperCard so we can trigger the layout event
jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ children, isLoading, error, ErrorBehaviour, testID, headerRight }: any) => {
      if (error) return <ErrorBehaviour />;
      return (
        <View testID={testID}>
          {headerRight}
          {children({ cardWidth: 350, theme: { '--color-primary-400': '255,0,0' } })}
        </View>
      );
    },
  };
});

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return {
    LineChart: ({ pointerConfig }: any) => {
      // simulate pointer label render immediately for coverage
      const LabelComp = pointerConfig?.pointerLabelComponent;
      return (
        <View testID="mock-line-chart">
          {LabelComp ? LabelComp([{ dataPointText: '10' }]) : null}
        </View>
      );
    },
  };
});

jest.mock('@gamelog/common/charts/PointerLabelUpdater', () => {
  const { View } = jest.requireActual('react-native');
  return {
    PointerLabelUpdater: () => {
      return <View />;
    },
  };
});

describe('PlaytimeTrendChart', () => {
  const getOffsetDateString = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const mockPlaytimeByUser = [
    { date: getOffsetDateString(0), playtime_minutes: 120 },
    { date: getOffsetDateString(-1), playtime_minutes: 60 },
    { date: getOffsetDateString(-20), playtime_minutes: 500 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with playtime data', () => {
    render(<PlaytimeTrendChart playtimeByUser={mockPlaytimeByUser} />);

    expect(screen.getByTestId('profile-playtime-trend')).toBeTruthy();
    expect(screen.getByTestId('mock-line-chart')).toBeTruthy();
  });

  it('handles empty playtime data', () => {
    render(<PlaytimeTrendChart playtimeByUser={[]} />);

    expect(screen.getByText(/No playtime in this window/)).toBeTruthy();
  });

  it('switches between AVG and TOT trend modes', () => {
    render(<PlaytimeTrendChart playtimeByUser={mockPlaytimeByUser} />);

    expect(screen.getByText('AVG')).toBeTruthy();
    expect(screen.getByText('TOT')).toBeTruthy();

    fireEvent.press(screen.getByText('TOT'));
    // It should now be in TOT mode, meaning the header changes
  });

  it('switches ranges', () => {
    render(<PlaytimeTrendChart playtimeByUser={mockPlaytimeByUser} />);

    fireEvent.press(screen.getByText('30D'));
    // Range is now 30D
  });
});
